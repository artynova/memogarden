import {
    and,
    count,
    eq,
    getTableColumns,
    InferInsertModel,
    isNotNull,
    lte,
    or,
    SQL,
    sql,
} from "drizzle-orm";
import { card, cardState, reviewLog, reviewRating } from "@/server/data/schema/card";
import db from "@/server/data/db";
import { deck } from "@/server/data/schema/deck";
import {
    addUpdatedAt,
    eqOptionalPlaceholder,
    eqPlaceholder,
    imatchPlaceholder,
    InferInsertModelFromGroup,
    InferSelectModelFromGroup,
    isNotDeleted,
    makeDeletedAt,
    makeInsertPlaceholders,
    makeUpdatePlaceholders,
    Pagination,
    takeFirstOrNull,
    toColumnMapping,
    toLimitOffset,
} from "@/server/data/services/utils";

import { escapeRegex } from "@/lib/utils";
import { Card, DECAY, FACTOR, Grade, ReviewLog } from "ts-fsrs";
import { retrievabilityAfterReview, scheduler } from "@/server/data/scheduler";
import { ReviewRating } from "@/lib/spaced-repetition";
import { inArray } from "drizzle-orm/sql/expressions/conditions";
import { forceSyncDeckHealth, getDeck } from "@/server/data/services/deck";
import { forceSyncUserHealth } from "@/server/data/services/user";

const cardPreviewColumns = [
    card.id,
    card.front,
    card.due,
    card.deckId,
    [deck.name, "deckName"],
    card.stateId,
    [cardState.name, "stateName"],
    card.retrievability,
    [deck.retrievability, "deckRetrievability"],
] as const;
const cardUpdateDataColumns = [card.front, card.back, card.deckId] as const;
const cardDataViewColumns = [...cardPreviewColumns, card.back] as const;
const cardMetadataColumns = [
    card.due,
    card.stability,
    card.difficulty,
    card.elapsedDays,
    card.scheduledDays,
    card.reps,
    card.lapses,
    card.stateId,
    card.lastReview,
] as const;
const cardSelectColumns = [...cardDataViewColumns, ...cardMetadataColumns] as const;

export type SelectCard = InferSelectModelFromGroup<typeof cardSelectColumns>;
export type SelectCardPreview = InferSelectModelFromGroup<typeof cardPreviewColumns>;
export type UpdateCardData = InferInsertModelFromGroup<typeof cardUpdateDataColumns>;
export type SelectCardDataView = InferSelectModelFromGroup<typeof cardDataViewColumns>;
export type CardMetadata = InferSelectModelFromGroup<typeof cardMetadataColumns>;
export type InsertLog = InferInsertModel<typeof reviewLog>;

/**
 * Filter using an inner query to test that the card is a non-deleted card that belongs to one of the user's decks.
 * Placeholders: "userId" = user's ID.
 */
const userCardTest = inArray(
    card.deckId,
    db.select({ id: deck.id }).from(deck).where(eqPlaceholder(deck.userId)), // User's decks
) as SQL<boolean>;

/**
 * Placeholders: "id" = card's ID, "userID" = user's ID.
 */
const checkCardAccessibility = db
    .select({ result: userCardTest })
    .from(card)
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("check_card_ownership");

/**
 * Placeholders: derived from cardCreateColumns.
 */
const insertCard = db
    .insert(card)
    .values(makeInsertPlaceholders(cardUpdateDataColumns))
    .returning({ id: card.id })
    .prepare("insert_card");

/**
 * Placeholders: "id" = card's ID, others derived from cardUpdateDataColumns.
 */
const updateCardData = db
    .update(card)
    .set(addUpdatedAt(makeUpdatePlaceholders(cardUpdateDataColumns)))
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_data");

/**
 * Placeholders: "id" = card's ID, others derived from cardMetadataColumns.
 */
const updateCardMetadata = db
    .update(card)
    .set(addUpdatedAt(makeUpdatePlaceholders(cardMetadataColumns))) // Adding the updatedAt timestamp because metadata (SRS data) updates are initiated by revision, which is a user interaction
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_metadata");

/**
 * Placeholders: "id" = card's ID.
 */
const selectCard = db
    .select(toColumnMapping(cardSelectColumns))
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(cardState, eq(cardState.id, card.stateId))
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("select_card");

/**
 * Placeholders: "id" = card's ID.
 */
const selectCardDataView = db
    .select(toColumnMapping(cardDataViewColumns))
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(cardState, eq(cardState.id, card.stateId))
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("select_card_data_view");

/**
 * Placeholders: "id" = card's ID.
 */
const selectCardMetadata = db
    .select(toColumnMapping(cardMetadataColumns))
    .from(card)
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("select_card_metadata");

/**
 * Placeholders: "deckId" = deck's ID, "anchor" = reference timestamp for the current moment.
 */
const selectNextCard = db
    .select(toColumnMapping(cardSelectColumns))
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(cardState, eq(cardState.id, card.stateId))
    .where(
        and(
            eqPlaceholder(card.deckId),
            lte(card.due, sql.placeholder("anchor")),
            isNotDeleted(card),
        ),
    )
    .orderBy(card.due, card.createdAt) // Secondary ordering by card update date just in case, to break any ties deterministically
    .limit(1)
    .prepare("select_next_card");

/**
 * Counts the total number of cards matching search filters, to calculate the total number of pages for pagination.
 * Placeholders: "userId" = user's ID (for retrieving cards from all of that user's decks if a specific deck is not
 * requested), "deckId" = specific deck's ID (or null), "query" = processed query regex
 * string (applied separately to the front text and the back text).
 */
const countCardsMatchingQuery = db
    .select({ count: count() })
    .from(card)
    .where(
        and(
            userCardTest,
            eqOptionalPlaceholder(card.deckId),
            or(imatchPlaceholder(card.front, "query"), imatchPlaceholder(card.back, "query")),
            isNotDeleted(card),
        ),
    )
    .prepare("count_cards_matching_query");

/**
 * Placeholders: "userId" = user's ID, "deckId" = specific deck's ID (or null), "query" = processed query regex string,
 * "limit" = pagination limit, "offset" = pagination offset.
 */
const selectCardsMatchingQuery = db
    .select(toColumnMapping(cardPreviewColumns)) // Minimal information necessary to reasonably identify cards in the search result screen - full information only fetched on-demand
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(cardState, eq(cardState.id, card.stateId))
    .where(
        and(
            eqPlaceholder(deck.userId),
            eqOptionalPlaceholder(deck.id, "deckId"),
            or(
                imatchPlaceholder(card.front, "query"), // Test card front against the provided query regex case-insensitively
                imatchPlaceholder(card.back, "query"), // Test the back
            ),
            isNotDeleted(card),
        ),
    )
    .orderBy(card.front, card.back, card.createdAt)
    .limit(sql.placeholder("limit"))
    .offset(sql.placeholder("offset"))
    .prepare("select_cards_matching_query");

/**
 * Placeholders: "id": card's ID.
 * Will not change the "deletedAt" timestamp if it already has a value.
 */
const deleteCard = db
    .update(card)
    .set(makeDeletedAt())
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("delete_card");

const selectReviewRatings = db.select().from(reviewRating).prepare("select_review_ratings");

/**
 * Placeholders: derived from columns in reviewLog.
 */
const insertReviewLog = db
    .insert(reviewLog)
    .values(makeInsertPlaceholders(getTableColumns(reviewLog)))
    .prepare("insert_review_log");

/**
 * Placeholders: "userId" = user's ID, "anchor" = reference Date for which the new retrievabilities are computed.
 */
const updateCardsRetrievability = db
    .update(card)
    .set({
        retrievability: sql`1 + (${FACTOR} * GREATEST(EXTRACT(DAY FROM ${sql.placeholder("anchor")} - ${card.lastReview}))) / ${card.stability})^(${DECAY}`, // This is safe because the WHERE clause ensures the card does have a last review date (i.e., it is not NULL)
    })
    .where(and(userCardTest, isNotNull(card.lastReview), isNotDeleted(card)))
    .prepare("update_retrievabilities");

/**
 * Placeholders: "id" = card's ID.
 */
const updateCardRetrievabilityAfterReview = db
    .update(card)
    .set({ retrievability: retrievabilityAfterReview })
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_retrievability_after_review");

/**
 * Checks whether a given user has access to a given card, i.e., currently - whether they are the owner.
 * A `true` response here also implies that the card exists and is not deleted.
 *
 * @param userId User's ID.
 * @param id Card's ID.
 * @return Whether the user can access the deck.
 */
export async function isCardAccessible(userId: string, id: string) {
    return (
        (await checkCardAccessibility.execute({ userId, id }).then(takeFirstOrNull))?.result ??
        false
    );
}

/**
 * Converts the ts-fsrs card object into MemoGarden's card metadata object.
 *
 * @param fsrsCard ts-fsrs card object.
 * @return Metadata object.
 */
export function toMetadata(fsrsCard: Card): CardMetadata {
    return {
        due: fsrsCard.due,
        stability: fsrsCard.stability,
        difficulty: fsrsCard.difficulty,
        elapsedDays: fsrsCard.elapsed_days,
        scheduledDays: fsrsCard.scheduled_days,
        reps: fsrsCard.reps,
        lapses: fsrsCard.lapses,
        stateId: fsrsCard.state,
        lastReview: fsrsCard.last_review ?? null,
    };
}

/**
 * Converts MemoGarden's card metadata object to a ts-fsrs card object.
 *
 * @param metadata Metadata object.
 * @return ts-fsrs card object.
 */
export function toFsrsCard(metadata: CardMetadata): Card {
    return {
        due: metadata.due,
        stability: metadata.stability,
        difficulty: metadata.difficulty,
        elapsed_days: metadata.elapsedDays,
        scheduled_days: metadata.scheduledDays,
        reps: metadata.reps,
        lapses: metadata.lapses,
        state: metadata.stateId,
        last_review: metadata.lastReview ?? undefined,
    };
}

/**
 * Constructs a MemoGarden review log insertion object based on a ts-fsrs log object and some MemoGarden-specific fields.
 *
 * @param cardId ID of the card whose revision is described by the log.
 * @param answerAttempt Text user entered when answering (not evaluated, just for user's reference).
 * @param fsrsLog Log returned by ts-fsrs.
 */
export function toInsertLog(cardId: string, answerAttempt: string, fsrsLog: ReviewLog): InsertLog {
    return {
        cardId,
        answerAttempt,
        ratingId: fsrsLog.rating,
        stateId: fsrsLog.state,
        due: fsrsLog.due,
        stability: fsrsLog.stability,
        difficulty: fsrsLog.difficulty,
        elapsedDays: fsrsLog.elapsed_days,
        lastElapsedDays: fsrsLog.last_elapsed_days,
        scheduledDays: fsrsLog.scheduled_days,
        review: fsrsLog.review,
    };
}

/**
 * Creates a new card with user input data and automatically initialized SRS metadata.
 *
 * @param data User input data.
 * @return Internal ID of the newly created card.
 */
export async function createCard(data: UpdateCardData) {
    // A newly created card has a retrievability of NULL, which is ignored during aggregate retrievability calculations, so there is no need to update the aggregates here because they are not impacted yet
    return (await insertCard.execute({ ...data }).then(takeFirstOrNull))!.id;
}

/**
 * Edits a flashcard's user-defined properties, specifically - its content and assigned deck.
 *
 * @param id Card's ID.
 * @param data Updated data.
 */
export async function editCard(id: string, data: UpdateCardData) {
    const card = await getCard(id);
    // If either the card does not exist or it does not have retrievability (i.e., is a new card), it does not impact aggregate health at all, so we do not need any extra deck manipulation
    if (!card?.retrievability) {
        await updateCardData.execute({ id, ...data });
        return;
    }

    const oldDeckId = card.deckId;
    await updateCardData.execute({ id, ...data });
    if (oldDeckId === data.deckId) return; // If the card stayed in the same deck, no aggregate health values are affected

    // If the card moved between decks, the source and the destination decks' average retrievabilities are affected. Since the account-wide aggregate health is computed without respect to decks, it is not affected, and only the decks themselves need to be updated
    await forceSyncDeckHealth(oldDeckId);
    await forceSyncDeckHealth(data.deckId);
}

/**
 * Soft-deletes a flashcard (marking it as deleted but not removing the data from the database).
 * Idempotent: deleting an already deleted card is a no-op (it will not change the deletion date).
 *
 * @param id Card's ID.
 */
export async function removeCard(id: string) {
    const card = await getCard(id);
    await deleteCard.execute({ id });
    if (!card?.retrievability) return; // If the card did not exist, or it had NULL retrievability, there is no need to update the aggregate retrievabilities

    const deck = (await getDeck(card.deckId))!; // Retrieving the deck to get the user's ID. Since at this point we know that the card was valid and non-deleted, the deck it references is also valid
    await forceSyncDeckHealth(deck.id);
    await forceSyncUserHealth(deck.userId); // Overall health is also affected by the deletion of a card with non-NULL retrievability
}

/**
 * Retrieves detailed information about one flashcard.
 *
 * @param id Card's ID.
 * @return Card information (both user-defined and app-managed), or `null` if the ID does not belong to a valid card.
 */
export async function getCard(id: string): Promise<SelectCard | null> {
    return selectCard.execute({ id }).then(takeFirstOrNull);
}

/**
 * Retrieves the next card that is due for revision in a deck.
 *
 * @param deckId Deck's ID.
 * @param anchor Reference moment in time (normally the current moment).
 * @return Selected card, or `null` if there are no due cards in the deck at the given moment.
 */
export async function getNextCard(deckId: string, anchor: Date): Promise<SelectCard | null> {
    return await selectNextCard.execute({ deckId, anchor }).then(takeFirstOrNull);
}

/**
 * Retrieves user-defined card information and key metadata for the preview UI (e.g., the name of the card's SRS state).
 *
 * @param id Card's ID.
 * @return Card data, or `null` if the ID does not belong to a valid card.
 */
export async function getCardDataView(id: string): Promise<SelectCardDataView | null> {
    return selectCardDataView.execute({ id }).then(takeFirstOrNull);
}

/**
 * Retrieves card metadata (i.e., the SRS data managed by the application).
 *
 * @param id Card's ID.
 * @return Card metadata, or `null` if the ID does not belong to a valid card.
 */
export async function getCardMetadata(id: string): Promise<CardMetadata | null> {
    return selectCardMetadata.execute({ id }).then(takeFirstOrNull);
}

/**
 * Retrieves names for all available revision ratings.
 *
 * @return Mapping of {@link ReviewRating} enum members to their names retrieved from the database.
 */
export async function getRatingNames() {
    const ratingsAndNames = await selectReviewRatings.execute();
    return Object.fromEntries(ratingsAndNames.map((entry) => [entry.id, entry.name])) as {
        [K in ReviewRating]: string;
    };
}

/**
 * Retrieves all possible review ratings mapped to corresponding next revision dates that would be scheduled if the
 * respective rating is chosen (similarly to how Anki gives a preview of scheduling for each rating).
 *
 * @param id Card's ID.
 * @param now Date at the time of answering (parametrized to allow syncing with other function calls).
 * @return Mapping of {@link ReviewRating} enum members to corresponding next card revision dates.
 */
export async function getCardRevisionOptions(id: string, now: Date) {
    const metadata = await getCardMetadata(id);
    if (!metadata || metadata.due < now) return null;
    const ratingNames = await getRatingNames();
    const preview = scheduler.repeat(toFsrsCard(metadata), now);
    return Object.fromEntries(
        [...preview].map((item) => [
            item.log.rating as number as ReviewRating, // The autogenerated previews do not have the Manual rating because that rating's purpose is to only be used for custom scheduling. Therefore, casting to MemoGarden's ReviewRating, which excludes the Manual rating and repeats other ratings exactly, is safe
            {
                name: ratingNames[item.log.rating as number as ReviewRating],
                due: item.card.due,
            },
        ]),
    ) as {
        [K in ReviewRating]: { name: string; due: Date };
    };
}

/**
 * Records a revision for a flashcard. If the flashcard is not due, fails and `null` is
 * returned. If it is due, updates the card's metadata and the account's overall state based on
 * the new retrievability. Also records the revision in the revision log for the card.
 *
 * @param id Card's ID.
 * @param answerAttempt User's attempt to reproduce the answer on the card's back (can be an empty string).
 * @param now Date at the time of answering (parametrized to allow syncing with other function calls).
 * @param rating Review rating selected by the user.
 * @return Updated card data, or `null` if the ID does not belong to a valid card.
 */
export async function reviewCard(
    id: string,
    answerAttempt: string,
    now: Date,
    rating: ReviewRating,
): Promise<SelectCard | null> {
    const metadata = await getCard(id);
    if (!metadata || metadata.due < now) return null;
    const scheduled = scheduler.next(toFsrsCard(metadata), now, rating as number as Grade); // The Grade enum is equivalent to MemoGarden's ReviewRating enum, so the cast is safe
    const newMetadata = toMetadata(scheduled.card);
    await updateCardMetadata.execute({ id, ...newMetadata });
    await insertReviewLog.execute(toInsertLog(id, answerAttempt, scheduled.log));

    // Aggregate retrievability update section
    await updateCardRetrievabilityAfterReview.execute({ id });
    const card = (await getCard(id))!; // At this point we know that the card exists and is valid, so getCard is guaranteed to return a proper result
    const deck = (await getDeck(card.deckId))!; // The deck of a valid card must also be valid
    await forceSyncDeckHealth(deck.id);
    await forceSyncUserHealth(deck.userId);

    return card;
}

/**
 * Splits a search query string into a regex string that checks for presence of all terms listed in it. Terms are
 * considered to be separated by whitespaces.
 *
 * @param queryString Query string, e.g., "cat dog".
 * @return Regex string, e.g., ```^(?=.*cat)(?=.*dog).*$```.
 */
function convertToSearchRegex(queryString: string) {
    const terms = queryString.split(/\s/);
    const processedTerms = terms.map((term) => escapeRegex(term).toLowerCase());
    const regexString = processedTerms.map((term) => `(?=.*${term})`).join(""); // Regex string with positive lookaheads for each term, asserting their presence
    return `^${regexString}.*$`;
}

export type PaginatedCardPreviews = {
    pageCards: SelectCardPreview[];
    page: number; // Useful in cases when accessing the page requested by pagination is impossible (e.g., there are too few results for that), and the actual page used for search was different from the requested one
    totalCards: number;
};

/**
 * Searches the user's collection of cards, filtering by occurrence of terms listed in the query and/or belonging to a
 * specific deck.
 *
 * @param userId User's ID.
 * @param pagination Pagination parameters for results.
 * @param queryString Unprocessed string version of the query (will be processed into search terms).
 * @param deckId ID of the deck (or `null`, which enables search in all decks of the user).
 * @return Array of flashcard search results with pagination applied, containing minimized preview information for
 * each card.
 */
export async function searchCards(
    userId: string,
    pagination: Pagination,
    queryString = "",
    deckId: string | null,
): Promise<PaginatedCardPreviews> {
    const query = convertToSearchRegex(queryString);
    const totalCards = (await countCardsMatchingQuery
        .execute({ userId, deckId, query })
        .then(takeFirstOrNull))!.count; // This is a counting query, so it will always return exactly one row
    const safePage =
        totalCards > pagination.pageSize * (pagination.page - 1)
            ? pagination.page // If the results have enough rows to support the requested pagination parameters, use the requested page directly
            : totalCards === 0
              ? 1
              : Math.ceil(totalCards / pagination.pageSize); // If there are too few results to use the requested page with the requested page size, use the last available page with this page size instead
    const pageCards = await selectCardsMatchingQuery.execute({
        userId,
        deckId,
        query,
        ...toLimitOffset({ ...pagination, page: safePage }),
    });
    return { pageCards, totalCards, page: safePage };
}

/**
 * Recalculates retrievability for all cards of the user at the given date, according to the forgetting curve formula
 * used by ts-fsrs.
 *
 * @param userId User's ID.
 * @param anchor Reference moment in time (normally the current moment).
 */
export async function forceSyncCardsHealth(userId: string, anchor: Date) {
    await updateCardsRetrievability.execute({ userId, anchor });
}
