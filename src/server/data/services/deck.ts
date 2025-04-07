import db from "@/server/data/db";
import { deck } from "@/server/data/schemas/deck";
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
import { card, cardState } from "@/server/data/schemas/card";
import { and, avg, count, eq, lte, sql } from "drizzle-orm";
import { inArray } from "drizzle-orm/sql/expressions/conditions";
import { forceSyncUserHealth } from "@/server/data/services/user";

import { CardState } from "@/lib/enums";

/**
 * Placeholders: "id" = deck's ID, "userID" = user's ID.
 */
const checkDeckAccessibility = db
    .select({ result: eqPlaceholder(deck.userId) })
    .from(deck)
    .where(and(eqPlaceholder(deck.id, undefined, true), isNotDeleted(deck)))
    .prepare("check_deck_ownership");

/**
 * Checks whether a given user can access a given deck, i.e., currently - whether the deck belongs to the user.
 * A `true` response here also implies that the deck exists and is not deleted.
 *
 * @param userId User's ID.
 * @param id Deck's ID.
 * @returns `true` if the user can access the deck, `false` otherwise.
 */
export async function isDeckAccessible(userId: string, id: string) {
    return (
        (await checkDeckAccessibility.execute({ userId, id }).then(takeFirstOrNull))?.result ??
        false
    );
}

const insertDeckColumns = [deck.name, deck.userId] as const;

/**
 * Deck insertion data.
 */
export type InsertDeck = InferInsertModelFromGroup<typeof insertDeckColumns>;

/**
 * Placeholders: derived from insertDeckColumns.
 */
const insertDeck = db
    .insert(deck)
    .values(makeInsertPlaceholders(insertDeckColumns))
    .returning({ id: deck.id })
    .prepare("insert_deck");

/**
 * Creates a new deck based on user input.
 *
 * @param data User input data for the deck, together with the user ID that is required to bind the deck to the user.
 * @returns Internal ID of the newly created deck.
 */
export async function createDeck(data: InsertDeck) {
    return (await insertDeck.execute(data).then(takeFirstOrNull))!.id;
}

const updateDeckColumns = [deck.name] as const;

/**
 * Deck update data.
 */
export type UpdateDeck = InferInsertModelFromGroup<typeof updateDeckColumns>;

/**
 * Placeholders: "id" = deck's ID, others derived from updateDeckColumns.
 */
const updateDeck = db
    .update(deck)
    .set(makeUpdatePlaceholders(updateDeckColumns))
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("update_deck");

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
 * Placeholders: "id": deck's ID.
 */
const deleteDeckCards = db
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
 * Soft-deletes the given deck and all cards inside it.
 * Idempotent: deleting an already deleted deck will not change the deletion date.
 *
 * @param id Deck's ID.
 */
export async function removeDeck(id: string) {
    const deck = await getDeck(id);
    if (!deck) return;
    await deleteDeckCards.execute({ id });
    await deleteDeckSelf.execute({ id });
    // Deleting a deck also deletes all of its cards, thus affecting the user health, but it does not affect other decks, so only the overall user health needs to be updated
    await forceSyncUserHealth(deck.userId);
}

/**
 * As opposed to {@link updateDecksRetrievability}, this prepared statement only updates a specific deck.
 * Placeholders: "id" = deck's ID.
 */
const updateDeckRetrievability = db
    .update(deck)
    .set({
        retrievability: sql`(${db
            .select({ average: avg(card.retrievability) })
            .from(card)
            .where(and(eq(card.deckId, deck.id), isNotDeleted(card)))
            .getSQL()})`, // Parentheses around the subquery are necessary to avoid syntax errors
    })
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("update_deck_retrievability");

/**
 * Updates the aggregate deck health metric of a specific non-deleted deck.
 *
 * @param id Deck's ID.
 */
export async function forceSyncDeckHealth(id: string) {
    await updateDeckRetrievability.execute({ id });
}

/**
 * Updates retrievabilities in all decks of a user.
 * Placeholders: "userId" = user's ID.
 */
const updateDecksRetrievability = db
    .update(deck)
    .set({
        retrievability: sql`(${db
            .select({ average: avg(card.retrievability) })
            .from(card)
            .where(and(eq(card.deckId, deck.id), isNotDeleted(card))) // NULL retrievabilities are ignored by the AVG function so no need to filter them out explicitly
            .getSQL()})`, // Parentheses around the subquery are necessary to avoid syntax errors
    })
    .where(and(eqPlaceholder(deck.userId), isNotDeleted(deck)))
    .prepare("update_decks_retrievability");

/**
 * Updates the aggregate deck health metric of user's non-deleted decks based on the individual cards' health metrics.
 *
 * @param userId User's ID.
 */
export async function forceSyncDecksHealth(userId: string) {
    await updateDecksRetrievability.execute({ userId });
}

/**
 * Numbers of different kinds of due cards remaining in some context (either a single deck or overall, for example).
 */
export type CardsRemaining = {
    /**
     * How many new cards are currently due.
     */
    new: number;
    /**
     * How many "learning" and "relearning" cards are currently due.
     */
    learning: number;
    /**
     * How many "review" (long-term) cards are currently due.
     */
    review: number;
};

/**
 * Placeholders: "id" = deck's ID, "anchor" = reference timestamp for the current moment.
 */
const selectDeckRevisionRemaining = db
    .select({ remaining: count(card.id) })
    .from(cardState)
    .leftJoin(
        card,
        and(
            eq(cardState.id, card.stateId),
            eqPlaceholder(card.deckId, "id"),
            lte(card.due, sql.placeholder("anchor")),
            isNotDeleted(card),
        ),
    )
    .groupBy(cardState.id)
    .orderBy(cardState.id)
    .prepare("select_deck_revision_remaining");

/**
 * Retrieves the numbers of different types of cards that are currently due for revision in a deck at a given time.
 *
 * @param id Deck's ID.
 * @param anchor Reference moment in time (normally the current moment).
 * @returns Information about how many new, learning, and review cards are currently due in the deck. All can be 0 if
 * the deck has no due cards at the given moment.
 */
export async function getDeckRemaining(id: string, anchor: Date) {
    const result = await selectDeckRevisionRemaining.execute({ id, anchor });
    return {
        new: result[CardState.New].remaining,
        learning: result[CardState.Learning].remaining + result[CardState.Relearning].remaining,
        review: result[CardState.Review].remaining,
    };
}

/**
 * Placeholders: "userId" = user's ID, "anchor" = reference timestamp for the current moment.
 */
const selectAllRevisionRemaining = db
    .select({ remaining: count(card.id) })
    .from(cardState)
    .leftJoin(
        card,
        and(
            eq(cardState.id, card.stateId),
            // Ensuring that the card is in one of the user's valid decks
            inArray(
                card.deckId,
                // Finding IDs of all non-deleted decks of the user
                db
                    .select({ id: deck.id })
                    .from(deck)
                    .where(and(eqPlaceholder(deck.userId), isNotDeleted(deck))),
            ),
            lte(card.due, sql.placeholder("anchor")),
            isNotDeleted(card),
        ),
    )
    .groupBy(cardState.id)
    .orderBy(cardState.id)
    .prepare("select_all_revision_remaining");

/**
 * Retrieves full the aggregate number of remaining due cards of different types in the user's entire collection.
 *
 * @param userId User's ID.
 * @param anchor Reference moment in time (normally the current moment).
 * @returns Aggregate remaining cards data for the user. All counts are set to `0` if the user does not exist.
 */
export async function getAllRemaining(userId: string, anchor: Date) {
    const result = await selectAllRevisionRemaining.execute({ userId, anchor });
    return {
        new: result[CardState.New].remaining,
        learning: result[CardState.Learning].remaining + result[CardState.Relearning].remaining,
        review: result[CardState.Review].remaining,
    };
}

const selectDeckPreviewColumns = [deck.id, deck.name, deck.retrievability] as const;

/**
 * Deck preview selection data.
 */
export type SelectDeckPreview = InferSelectModelFromGroup<typeof selectDeckPreviewColumns>;

/**
 * Deck's own stored information (name, ID, etc.) combined with information about cards remaining
 * for review.
 */
export type DeckPreview = {
    /**
     * Deck's own information.
     */
    deck: SelectDeckPreview;
    /**
     * Aggregate information about cards remaining for review.
     */
    remaining: CardsRemaining;
};

/**
 * Placeholders: "id" = deck's ID.
 */
const selectDeckPreview = db
    .select(toColumnMapping(selectDeckPreviewColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("select_deck_preview");

/**
 * Retrieves full data necessary to show the user a preview of a deck. This includes the deck's own information (like
 * name) as well as a {@link CardsRemaining} object describing the remaining cards for revision at the given moment.
 *
 * @param id Deck's ID.
 * @param anchor Reference moment in time (normally the current moment).
 * @returns Deck preview data, or `null` if the ID is not one of a valid deck.
 */
export async function getDeckPreview(id: string, anchor: Date) {
    const deck = await selectDeckPreview.execute({ id }).then(takeFirstOrNull);
    if (!deck) return null;
    const preview = await getDeckRemaining(id, anchor);
    return { deck, remaining: preview };
}

/**
 * Placeholders: "userId" = user's ID.
 */
const selectUserDecksPreview = db
    .select(toColumnMapping(selectDeckPreviewColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.userId), isNotDeleted(deck)))
    .orderBy(deck.createdAt) // Simple deterministic order
    .prepare("select_user_decks_preview");

/**
 * Retrieves all decks of a given user together with the numbers of different types of cards remaining for revision in
 * each deck.
 *
 * @param userId User's ID.
 * @param anchor Reference moment in time (usually the current moment).
 * @returns Deck previews.
 */
export async function getDecksPreview(userId: string, anchor: Date) {
    const decks = await selectUserDecksPreview.execute({ userId });
    return Promise.all(
        decks.map(async (deck) => {
            return { deck, remaining: await getDeckRemaining(deck.id, anchor) };
        }),
    );
}

const selectDeckColumns = [...selectDeckPreviewColumns, deck.userId] as const;

/**
 * General deck selection data.
 */
export type SelectDeck = InferSelectModelFromGroup<typeof selectDeckColumns>;

/**
 * Placeholders: "id" = deck's ID.
 */
const selectDeck = db
    .select(toColumnMapping(selectDeckColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.id), isNotDeleted(deck)))
    .prepare("select_deck");

/**
 * Simply retrieves basic information about a deck (without any cross-table lookups). Mostly for internal use.
 *
 * @param id Deck's ID.
 * @returns Retrieved deck, or `null` if the ID is not one of a valid deck.
 */
export async function getDeck(id: string) {
    return await selectDeck.execute({ id }).then(takeFirstOrNull);
}

const selectDeckOptionsColumns = [
    [deck.id, "value"],
    [deck.name, "label"],
] as const;

/**
 * Placeholders: "userId" = user's ID.
 */
const selectUserDeckOptions = db
    .select(toColumnMapping(selectDeckOptionsColumns))
    .from(deck)
    .where(and(eqPlaceholder(deck.userId), isNotDeleted(deck)))
    .orderBy(deck.createdAt)
    .prepare("select_user_deck_options");

/**
 * Retrieves all available options for assigning a deck to a user's card.
 *
 * @param userId User's ID.
 * @returns IDs and names of all non-deleted decks of the user.
 */
export async function getDeckOptions(userId: string) {
    return selectUserDeckOptions.execute({ userId });
}
