import { and, count, eq, getTableColumns, InferInsertModel, lte, SQL, sql } from "drizzle-orm";
import { card, cardState, reviewLog } from "@/server/data/schemas/card";
import db from "@/server/data/db";
import { deck } from "@/server/data/schemas/deck";
import {
    eqOptionalPlaceholder,
    eqPlaceholder,
    imatch,
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

import { escapeRegex } from "@/lib/utils/generic";
import { Card, DECAY, FACTOR, Grade, ReviewLog } from "ts-fsrs";
import { scheduler } from "@/server/data/scheduler";
import { inArray } from "drizzle-orm/sql/expressions/conditions";
import { forceSyncDeckHealth, getDeck } from "@/server/data/services/deck";
import { forceSyncUserHealth } from "@/server/data/services/user";

import { ReviewRating } from "@/lib/enums";
import removeMd from "remove-markdown";

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
    .where(and(eqPlaceholder(card.id, undefined, true), isNotDeleted(card)))
    .prepare("check_card_ownership");

/**
 * Checks whether a given user has access to a given card, i.e., currently - whether they are the owner.
 * A `true` response here also implies that the card exists and is not deleted.
 *
 * @param userId User's ID.
 * @param id Card's ID.
 * @returns `true` if the user can access the card, `false` otherwise.
 */
export async function isCardAccessible(userId: string, id: string) {
    return (
        (await checkCardAccessibility.execute({ userId, id }).then(takeFirstOrNull))?.result ??
        false
    );
}

/**
 * Columns for external input inference, come from the user
 */
const modifyCardColumns = [card.front, card.back, card.deckId] as const;

/**
 * Card modification data (either for creating or updating a card).
 */
export type ModifyCardData = InferInsertModelFromGroup<typeof modifyCardColumns>;

// External columns plus helper plain columns (with stripped formatting) that are computed automatically
const modifyCardColumnsInternal = [...modifyCardColumns, card.frontPlain, card.backPlain] as const;

/**
 * Full card modification data (including plain front and back content that is computed automatically).
 */
type ModifyCardDataInternal = InferInsertModelFromGroup<typeof modifyCardColumnsInternal>;

/**
 * Computes plain (with stripped Markdown formatting) card front and back values and returns a full internal card modification data object.
 *
 * @param data External card modification input data.
 * @returns Same data with plain front and back values added.
 */
export function modifyDataToInternal(data: ModifyCardData): ModifyCardDataInternal {
    return { ...data, frontPlain: removeMd(data.front), backPlain: removeMd(data.back) };
}

/**
 * Placeholders: derived from modifyCardColumnsInternal.
 */
const insertCard = db
    .insert(card)
    .values(makeInsertPlaceholders(modifyCardColumnsInternal))
    .returning({ id: card.id })
    .prepare("insert_card");

/**
 * Creates a new card with user input data and automatically initialized SRS metadata.
 *
 * @param data User input data.
 * @returns Internal ID of the newly created card.
 */
export async function createCard(data: ModifyCardData) {
    const id = (await insertCard.execute(modifyDataToInternal(data)).then(takeFirstOrNull))!.id;
    const deck = (await getDeck(data.deckId))!;
    await forceSyncDeckHealth(deck.id);
    await forceSyncUserHealth(deck.userId);
    return id;
}

/**
 * Placeholders: "id" = card's ID, others derived from modifyCardColumnsInternal.
 */
const updateCardData = db
    .update(card)
    .set(makeUpdatePlaceholders(modifyCardColumns))
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_data");

/**
 * Edits a card's user-defined properties, specifically - its content and assigned deck.
 *
 * @param id Card's ID.
 * @param data New data.
 */
export async function editCard(id: string, data: ModifyCardData) {
    const card = await getCard(id);
    if (!card) return;

    const oldDeckId = card.deckId;
    await updateCardData.execute({ id, ...modifyDataToInternal(data) });
    if (oldDeckId === data.deckId) return; // If the card stayed in the same deck, no aggregate health values are affected

    // If the card moved between decks, the source and the destination decks' average retrievabilities are affected. Since the account-wide aggregate health is computed without respect to decks, it is not affected, and only the decks themselves need to be updated
    await forceSyncDeckHealth(oldDeckId);
    await forceSyncDeckHealth(data.deckId);
}

/**
 * Placeholders: "id" = card's ID.
 * Will not change the "deletedAt" timestamp if it already has a value.
 */
const deleteCard = db
    .update(card)
    .set(makeDeletedAt())
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("delete_card");

/**
 * Soft-deletes a flashcard (marking it as deleted but not removing the data from the database).
 * Idempotent: deleting an already deleted card will not change the deletion date.
 *
 * @param id Card's ID.
 */
export async function removeCard(id: string) {
    const card = await getCard(id);
    if (!card) return; // If the card did not exist
    await deleteCard.execute({ id });

    const deck = (await getDeck(card.deckId))!; // Retrieving the deck to get the user's ID. Since at this point we know that the card was valid and non-deleted, the deck it references is also valid
    await forceSyncDeckHealth(deck.id);
    await forceSyncUserHealth(deck.userId);
}

const cardPreviewColumns = [
    card.id,
    card.front,
    card.due,
    [deck.name, "deckName"],
    card.retrievability,
] as const;

/**
 * Concise card selection data, used for previews in browsing mode.
 */
export type SelectCardPreview = InferSelectModelFromGroup<typeof cardPreviewColumns>;

/**
 * Paginated slice of card search results with final pagination data (page and total cards).
 */
export type PaginatedCardPreviews = {
    /**
     * Cards in the results slice.
     */
    pageCards: SelectCardPreview[];
    /**
     * Page number, useful in cases when accessing the page requested by pagination is
     * impossible (e.g., there are too few results for that), and the actual page used for search
     * was different from the requested one.
     */
    page: number;
    /**
     * Total number of cards in the results set.
     */
    totalCards: number;
};

/**
 * Splits a search query string into a regex string that checks for presence of all terms listed in it. Terms are
 * considered to be separated by whitespaces.
 *
 * @param queryString Query string, e.g., "cat dog".
 * @returns Regex string, e.g., ```^(?=.*cat)(?=.*dog).*$```.
 */
function convertToSearchRegex(queryString: string) {
    const terms = queryString.split(/\s/);
    const processedTerms = terms.map((term) => escapeRegex(term).toLowerCase());
    const regexString = processedTerms.map((term) => `(?=.*${term})`).join(""); // Regex string with positive lookaheads for each term, asserting their presence
    return `^${regexString}.*$`;
}

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
            imatch(sql`CONCAT_WS(' ', ${card.front}, ${card.back})`, sql.placeholder("query")), // Use a combination of both front and back so that results include cards where front and back together have all the terms even if neither has all of them on its own
            isNotDeleted(card),
        ),
    )
    .prepare("count_cards_matching_query");

/**
 * Placeholders: "userId" = user's ID, "deckId" = specific deck's ID (or null), "query" = processed query regex string,
 * "limit" = pagination limit, "offset" = pagination offset.
 */
const selectCardsMatchingQuery = db
    .select(toColumnMapping(cardPreviewColumns))
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(cardState, eq(cardState.id, card.stateId))
    .where(
        and(
            eqPlaceholder(deck.userId),
            eqOptionalPlaceholder(deck.id, "deckId"),
            imatch(sql`CONCAT_WS(' ', ${card.front}, ${card.back})`, sql.placeholder("query")), // Use a combination of both front and back so that results include cards where front and back together have all the terms even if neither has all of them on its own
            isNotDeleted(card),
        ),
    )
    .orderBy(card.frontPlain, card.backPlain, card.createdAt) // Order by plain values to avoid confusion in the browse UI
    .limit(sql.placeholder("limit"))
    .offset(sql.placeholder("offset"))
    .prepare("select_cards_matching_query");

/**
 * Searches the user's collection of cards, filtering by occurrence of terms listed in the query and/or belonging to a
 * specific deck.
 *
 * @param userId User's ID.
 * @param pagination Pagination parameters for results.
 * @param queryString Unprocessed string version of the query (will be processed into search terms).
 * @param deckId ID of the deck (or `null`, which enables search in all decks of the user).
 * @returns Array of card search results with pagination applied, containing minimized preview information for each
 * card.
 */
export async function searchCards(
    userId: string,
    pagination: Pagination,
    queryString = "",
    deckId: string | null,
) {
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

const { id: _id, ...insertReviewLogColumnMapping } = getTableColumns(reviewLog);

/**
 * Card SRS metadata.
 */
export type CardMetadata = InferSelectModelFromGroup<typeof cardMetadataColumns>;

/**
 * Review log insertion data.
 */
export type InsertLog = InferInsertModel<typeof reviewLog>;

/**
 * Converts the ts-fsrs card object into MemoGarden's card metadata object.
 *
 * @param fsrsCard ts-fsrs card object.
 * @returns Metadata object.
 */
function toMetadata(fsrsCard: Card): CardMetadata {
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
 * @returns ts-fsrs card object.
 */
function toFsrsCard(metadata: CardMetadata): Card {
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
 * Constructs a review log insertion object based on a ts-fsrs log object and some app-specific fields.
 *
 * @param cardId ID of the card whose revision is described by the log.
 * @param answerAttempt Text the user entered when answering.
 * @param fsrsLog Log returned by ts-fsrs.
 * @returns Log insertion data.
 */
function toInsertLog(cardId: string, answerAttempt: string, fsrsLog: ReviewLog): InsertLog {
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
 * Placeholders: "id" = card's ID, others derived from cardMetadataColumns.
 */
const updateCardMetadata = db
    .update(card)
    .set(makeUpdatePlaceholders(cardMetadataColumns))
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_metadata");

/**
 * Placeholders: derived from insertReviewLogColumnMapping.
 */
const insertReviewLog = db
    .insert(reviewLog)
    .values(makeInsertPlaceholders(insertReviewLogColumnMapping))
    .prepare("insert_review_log");

/**
 * Placeholders: "id" = card's ID.
 */
const updateCardRetrievabilityAfterReview = db
    .update(card)
    .set({ retrievability: 1 })
    .where(and(eqPlaceholder(card.id), isNotDeleted(card)))
    .prepare("update_card_retrievability_after_review");

/**
 * Records a revision for a card. If the card is not due, does nothing. If it is due, updates the card's SRS metadata
 * and the account's overall state based on the new retrievability. Also records the review in the card's review log.
 *
 * @param id Card's ID.
 * @param answerAttempt User's attempt to reproduce the answer on the card's back (can be an empty string).
 * @param now Date at the time of answering (parametrized to allow syncing with other function calls).
 * @param endOfDay Date at the end of the current day in the user's timezone.
 * @param rating Review rating selected by the user.
 */
export async function reviewCard(
    id: string,
    answerAttempt: string,
    now: Date,
    endOfDay: Date,
    rating: ReviewRating,
) {
    const metadata = await getCard(id);
    if (!metadata || metadata.due > endOfDay) return;
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
}

/**
 * Placeholders: "userId" = user's ID, "anchor" = reference Date for which the new retrievabilities are computed.
 */
const updateCardsRetrievability = db
    .update(card)
    .set({
        retrievability: sql`(1 + (${FACTOR} * EXTRACT (DAY FROM (${sql.placeholder("anchor")} - COALESCE (${card.lastReview}, ${card.createdAt})))) / ${card.stability})
                            ^(
                            ${DECAY}
                            )`,
    })
    .where(and(userCardTest, isNotDeleted(card)))
    .prepare("update_cards_retrievability");

/**
 * Recalculates retrievability for all cards of the user at the given date, according to the forgetting curve formula
 * used by ts-fsrs.
 *
 * @param userId User's ID.
 * @param anchor Reference moment in time (normally the middle of the current day in user's timezone).
 */
export async function forceSyncCardsHealth(userId: string, anchor: Date) {
    await updateCardsRetrievability.execute({ userId, anchor });
}

const cardDataViewColumns = [
    ...cardPreviewColumns,
    card.back,
    card.scheduledDays,
    card.deckId,
    card.stateId,
] as const;

/**
 * Card data view selection data (without detailed SRS metadata).
 */
export type SelectCardDataView = InferSelectModelFromGroup<typeof cardDataViewColumns>;

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
 * Retrieves user-defined card information and key metadata for the preview UI (e.g., the name of the card's SRS state).
 *
 * @param id Card's ID.
 * @returns Card view data, or `null` if the ID does not belong to a valid card.
 */
export async function getCardDataView(id: string) {
    return selectCardDataView.execute({ id }).then(takeFirstOrNull);
}

const cardSelectColumns = [...cardDataViewColumns, ...cardMetadataColumns] as const;

/**
 * General card selection data.
 */
export type SelectCard = InferSelectModelFromGroup<typeof cardSelectColumns>;

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
 * Retrieves detailed information about one card.
 *
 * @param id Card's ID.
 * @returns Card data (both user-defined and app-managed), or `null` if the ID does not belong to a valid card.
 */
export async function getCard(id: string) {
    return selectCard.execute({ id }).then(takeFirstOrNull);
}

/**
 * Placeholders: "deckId" = deck's ID, "anchor" = reference timestamp for the latest acceptable revision due date.
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
    .orderBy(card.due, card.createdAt) // Secondary ordering by card creation date just in case, to break any ties deterministically
    .limit(1)
    .prepare("select_next_card");

/**
 * Retrieves the next card that is due for revision in a deck.
 *
 * @param deckId Deck's ID.
 * @param anchor Last acceptable moment for the revision due date (normally the end of the current day in user's
 * timezone).
 * @returns Next card, or `null` if there are no due cards in the deck at the given moment.
 */
export async function getNextCard(deckId: string, anchor: Date) {
    return selectNextCard.execute({ deckId, anchor }).then(takeFirstOrNull);
}
