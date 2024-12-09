import db from "@/server/data/db";
import { deck } from "@/server/data/schema/deck";
import {
    eqPlaceholder,
    InferInsertModelFromGroup,
    InferSelectModelFromGroup,
    isNotDeleted,
    makeDeletedAt,
    makeInsertPlaceholders,
    makeUpdatePlaceholders,
    takeFirstOrNull,
    toColumnMapping,
} from "@/server/data/services/utils";
import { card, cardState } from "@/server/data/schema/card";
import { and, avg, count, eq, lte, sql } from "drizzle-orm";
import { CardState } from "@/lib/types";

const updateDeckColumns = [deck.name] as const;
const insertDeckColumns = [...updateDeckColumns, deck.userId] as const;
const selectDeckPreviewColumns = [deck.id, deck.name, deck.retrievability] as const;
const selectDeckColumns = [...selectDeckPreviewColumns, deck.userId] as const;

export type UpdateDeck = InferInsertModelFromGroup<typeof updateDeckColumns>;
export type InsertDeck = InferInsertModelFromGroup<typeof insertDeckColumns>;
export type SelectDeckPreview = InferSelectModelFromGroup<typeof selectDeckPreviewColumns>;

/**
 * Placeholders: "id" = deck's ID, "userID" = user's ID.
 */
const checkDeckOwnership = db
    .select({ result: eqPlaceholder(deck.userId) })
    .from(deck)
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("check_deck_ownership");

/**
 * Placeholders: derived from insertDeckColumns.
 */
const insertDeck = db
    .insert(deck)
    .values(makeInsertPlaceholders(insertDeckColumns))
    .returning({ id: deck.id })
    .prepare("insert_deck");

/**
 * Placeholders: "id" = deck's ID, others derived from updateDeckColumns.
 */
const updateDeck = db
    .update(deck)
    .set(makeUpdatePlaceholders(updateDeckColumns))
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("update_deck");

/**
 * Placeholders: "id": deck's ID.
 */
const deleteCardsInDeck = db
    .update(card)
    .set(makeDeletedAt())
    .where(and(eqPlaceholder(card.deckId, "id"), isNotDeleted(card)))
    .prepare("delete_deck_cards");

/**
 * Placeholders: "id": deck's ID.
 */
const deleteDeckSelf = db
    .update(deck)
    .set(makeDeletedAt())
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("delete_deck_self");

/**
 * Placeholders: "id" = deck's ID, "anchor" = reference timestamp for the current moment.
 */
const selectDeckRevisionRemaining = db
    .select({ state: card.stateId, remaining: count(card.id) })
    .from(card)
    .rightJoin(cardState, eq(cardState.id, card.stateId)) // To force presence of all states in the resulting table (even if there are no cards corresponding to them, in which case the ID is NULL and the card is not counted by the COUNT clause)
    .where(
        and(
            eqPlaceholder(card.deckId, "id"),
            lte(card.due, sql.placeholder("anchor")),
            isNotDeleted(card),
        ),
    )
    .groupBy(card.stateId)
    .orderBy(card.stateId)
    .prepare("select_deck_revision_remaining");

/**
 * Placeholders: "id" = deck's ID.
 */
const selectDeckPreview = db
    .select(toColumnMapping(selectDeckPreviewColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("select_deck_preview");

/**
 * Placeholders: "id" = deck's ID.
 */
const selectDeck = db
    .select(toColumnMapping(selectDeckColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("select_deck");

/**
 * Updates retrievabilities in all decks of a user.
 * Placeholders: "userId" = user's ID.
 */
const updateDecksRetrievability = db
    .update(deck)
    .set({
        retrievability: db
            .select({ average: avg(card.retrievability) })
            .from(card)
            .where(and(eq(card.deckId, deck.id), isNotDeleted(card))) // NULL retrievabilities are ignored by the AVG function so no need to filter them out explicitly
            .getSQL(),
    })
    .where(and(eqPlaceholder(deck.userId), isNotDeleted(deck)));

/**
 * As opposed to {@link updateDecksRetrievability}, this prepared statement only updates a specific deck.
 * Placeholders: "id" = deck's ID.
 */
const updateDeckRetrievability = db
    .update(deck)
    .set({
        retrievability: db
            .select({ average: avg(card.retrievability) })
            .from(card)
            .where(and(eq(card.deckId, deck.id), isNotDeleted(card)))
            .getSQL(),
    })
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)));

/**
 * Checks whether a given user can edit a given deck, i.e., currently - whether the deck belongs to the user.
 * A `true` response here also implies that the deck exists and is not deleted.
 *
 * @param userId User's ID.
 * @param id Deck's ID.
 * @return Whether the user can edit the deck.
 */
export async function canEditDeck(userId: string, id: string) {
    return (
        (await checkDeckOwnership.execute({ userId, id }).then(takeFirstOrNull))?.result ?? false
    );
}

/**
 * Creates a new deck based on user input.
 *
 * @param data User input data for the deck, together with the user ID that is required to bind the deck to the user.
 * @return Internal ID of the newly created deck.
 */
export async function createDeck(data: InsertDeck) {
    return (await insertDeck.execute(data).then(takeFirstOrNull))!.id;
}

/**
 * Edits the user-controlled data about a deck.
 *
 * @param id Deck's ID (the function is a no-op if it is not an ID of a valid active deck).
 * @param data New user input data for the deck.
 */
export async function editDeck(id: string, data: UpdateDeck) {
    await updateDeck.execute({ id, ...data });
}

/**
 * Soft-deletes the given deck and all cards inside it.
 * Idempotent: deleting an already deleted deck is a no-op (it will not change the deletion date).
 *
 * @param id Deck's ID.
 */
export async function removeDeck(id: string) {
    await deleteCardsInDeck.execute({ id });
    await deleteDeckSelf.execute({ id });
    await forceSyncDeckHealth(id);
}

/**
 * Simply retrieves basic information about a deck (without any cross-table lookups). Mostly for internal use.
 *
 * @param id Deck's ID.
 * @return Retrieved deck, or `null` if the ID is not one of a valid deck.
 */
export async function getDeck(id: string) {
    return await selectDeck.execute({ id }).then(takeFirstOrNull);
}

/**
 * Numbers of different kinds of due cards remaining in the deck.
 */
export type DeckRemaining = {
    /**
     * How many new cards in the deck are currently due.
     */
    new: number;
    /**
     * How many "learning" and "relearning" cards in the deck are currently due.
     */
    learning: number;
    /**
     * How many "review" (long-term) cards in the deck are currently due.
     */
    review: number;
};

/**
 * Deck's own stored information (name, ID, etc.) combined
 */
export type DeckPreview = {
    deck: SelectDeckPreview;
    preview: DeckRemaining;
};

/**
 * Retrieves the numbers of different types of cards that are currently due for revision in a deck at a given time.
 *
 * @param id Deck's ID.
 * @param anchor Reference moment in time (normally the current moment).
 * @return Information about how many new, learning, and review cards are currently due in the deck. All can be 0 if
 * the deck has no due cards at the given moment.
 */
export async function getDeckRemaining(id: string, anchor: Date): Promise<DeckRemaining> {
    const result = await selectDeckRevisionRemaining.execute({ id, anchor });
    return {
        new: result[CardState.New].remaining,
        learning: result[CardState.Learning].remaining + result[CardState.Relearning].remaining,
        review: result[CardState.Review].remaining,
    };
}

/**
 * Retrieves full data necessary to show the user a preview of a deck. This includes the deck's own information (like
 * name) as well as a {@link DeckRemaining} object describing the remaining cards for revision at the given moment.
 *
 * @param id Deck's ID.
 * @param anchor Reference moment in time (normally the current moment).
 */
export async function getDeckPreview(id: string, anchor: Date): Promise<DeckPreview | null> {
    const deck = await selectDeckPreview.execute({ id }).then(takeFirstOrNull);
    if (!deck) return null;
    const preview = await getDeckRemaining(id, anchor);
    return { deck, preview };
}

/**
 * Updates the aggregate deck health metric of user's non-deleted decks based on the individual cards' health metrics.
 *
 * @param userId User's ID.
 */
export async function forceSyncDecksHealth(userId: string) {
    await updateDecksRetrievability.execute({ userId });
}

/**
 * Updates the aggregate deck health metric of a specific non-deleted deck.
 *
 * @param id Deck's ID.
 */
export async function forceSyncDeckHealth(id: string) {
    await updateDeckRetrievability.execute({ id });
}
