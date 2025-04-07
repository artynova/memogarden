/* eslint-disable jsdoc/require-jsdoc */
import "@/scripts/load-test-env";
import db from "@/server/data/db";
import { user, userCredentials } from "@/server/data/schemas/user";
import { defineConfig } from "cypress";
import {
    createCredentialsUser,
    editUser,
    forceSyncUserHealth,
    updateUserHealthSyncDate,
} from "@/server/data/services/user";
import { createDeck, forceSyncDecksHealth, removeDeck } from "@/server/data/services/deck";
import { card, reviewLog } from "@/server/data/schemas/card";
import { deck } from "@/server/data/schemas/deck";
import { and, getTableColumns } from "drizzle-orm";
import {
    eqPlaceholder,
    isNotDeleted,
    makeInsertPlaceholders,
    takeFirstOrNull,
} from "@/server/data/services/utils";
import { DateTime } from "luxon";
import removeMd from "remove-markdown";
import { removeCard } from "@/server/data/services/card";
import {
    DeckSeedData,
    ExistingCardSeedData,
    NewCardSeedData,
    ReviewLogSeedData,
    UserSeedData,
} from "cypress/support";
import { env } from "@/server/env";

const clearLogs = db.delete(reviewLog).prepare("test_clear_logs");
const clearCards = db.delete(card).prepare("test_clear_cards");
const clearDecks = db.delete(deck).prepare("test_clear_decks");
const clearCredentials = db.delete(userCredentials).prepare("test_clear_credentials");
const clearUsers = db.delete(user).prepare("test_clear_users");

const selectUser = db.select().from(user).prepare("test_select_user");

/**
 * Placeholders: "name" = deck name.
 */
const selectDeck = db
    .select()
    .from(deck)
    .where(and(eqPlaceholder(deck.name), isNotDeleted(deck)))
    .prepare("test_select_deck");

const insertNewCardColumns = [card.deckId, card.front, card.frontPlain, card.back, card.backPlain];

const insertCardColumns = [
    ...insertNewCardColumns,
    card.due,
    card.lastReview,
    card.stateId,
    card.scheduledDays,
    card.retrievability,
];

/**
 * Placeholders: derived from insertNewCardColumns.
 */
const insertNewCard = db
    .insert(card)
    .values(makeInsertPlaceholders(insertNewCardColumns))
    .returning({ id: card.id })
    .prepare("test_insert_card_without_dates");

/**
 * Placeholders: derived from insertCardColumns.
 */
const insertCard = db
    .insert(card)
    .values(makeInsertPlaceholders(insertCardColumns))
    .returning({ id: card.id })
    .prepare("test_insert_card");

/**
 * Placeholders: "front" = card front, "back" = card back.
 */
const selectCard = db
    .select()
    .from(card)
    .where(and(eqPlaceholder(card.front), eqPlaceholder(card.back), isNotDeleted(card)))
    .prepare("test_select_card");

const { id: _id, ...insertReviewLogColumnMapping } = getTableColumns(reviewLog);

/**
 * Placeholders: derived from reviewLog
 */
const insertLog = db
    .insert(reviewLog)
    .values(makeInsertPlaceholders(insertReviewLogColumnMapping))
    .prepare("test_insert_log");

const selectLogs = db.select().from(reviewLog).prepare("select_get_logs");

export default defineConfig({
    e2e: {
        baseUrl: `http://localhost:${env.PORT ?? 3000}`,
        retries: 3,
        setupNodeEvents(on, config) {
            on("task", {
                /**
                 * Clears all dynamic app database data.
                 *
                 * @returns `null`.
                 */
                async cleanupDatabase() {
                    await clearLogs.execute();
                    await clearCards.execute();
                    await clearDecks.execute();
                    await clearCredentials.execute();
                    await clearUsers.execute();
                    return null;
                },

                /**
                 * Inserts credentials user data into the database.
                 *
                 * @param data Task parameters.
                 * @param data.user User data.
                 * @returns User's ID.
                 */
                async createCredentialsUser({ user }: { user: Omit<UserSeedData, "cards"> }) {
                    const id = await createCredentialsUser(
                        user.email,
                        user.password,
                        user.timezone,
                    );
                    await editUser(id, user);
                    return id;
                },

                /**
                 * Retrieves first user from the database.
                 *
                 * @returns User's data.
                 */
                async getUser() {
                    return selectUser.execute().then(takeFirstOrNull);
                },

                /**
                 * Inserts deck data into the database.
                 *
                 * @param data Task data.
                 * @param data.userId User's ID.
                 * @param data.deck Deck data.
                 * @returns Deck's ID.
                 */
                async createDeck({
                    userId,
                    deck,
                }: {
                    userId: string;
                    deck: Omit<DeckSeedData, "cards">;
                }) {
                    return createDeck({ userId, ...deck });
                },

                /**
                 * Retrieves first deck with the exact given name from the database.
                 *
                 * @param data Task data.
                 * @param data.name Deck name.
                 * @returns Deck data or `null`.
                 */
                async findDeck({ name }: { name: string }) {
                    return selectDeck.execute({ name }).then(takeFirstOrNull);
                },

                /**
                 * Soft-deletes given deck.
                 *
                 * @param data Task data.
                 * @param data.id Deck's ID.
                 * @returns `null`.
                 */
                async deleteDeck({ id }: { id: string }) {
                    await removeDeck(id);
                    return null;
                },

                /**
                 * Inserts new card data into the database.
                 *
                 * @param data Task data.
                 * @param data.deckId Deck ID.
                 * @param data.card Card data.
                 * @returns Card ID.
                 */
                async createNewCard({
                    deckId,
                    card,
                }: {
                    deckId: string;
                    card: Omit<NewCardSeedData, "stateId" | "reviewsToSimulate">;
                }) {
                    return (await insertNewCard
                        .execute({
                            deckId,
                            ...card,
                            frontPlain: removeMd(card.front),
                            backPlain: removeMd(card.back),
                        })
                        .then(takeFirstOrNull))!.id;
                },

                /**
                 * Inserts existing card data into the database.
                 *
                 * @param data Task data.
                 * @param data.deckId Deck ID.
                 * @param data.card Card data.
                 * @returns Card ID.
                 */
                async createCard({
                    deckId,
                    card,
                }: {
                    deckId: string;
                    card: Omit<ExistingCardSeedData, "reviewsToSimulate">;
                }) {
                    return (await insertCard
                        .execute({
                            deckId,
                            ...card,
                            frontPlain: removeMd(card.front),
                            backPlain: removeMd(card.back),
                            due: new Date(card.due),
                            lastReview: new Date(card.lastReview),
                        })
                        .then(takeFirstOrNull))!.id;
                },

                /**
                 * Retrieves card with the exact given front and back from the database.
                 *
                 * @param data Task data.
                 * @param data.front Card front.
                 * @param data.back Card back.
                 * @returns Card data or `null`.
                 */
                async findCard({ front, back }: { front: string; back: string }) {
                    return selectCard.execute({ front, back }).then(takeFirstOrNull);
                },

                /**
                 * Soft-deletes given card.
                 *
                 * @param data Task data.
                 * @param data.id Card ID.
                 * @returns `null`.
                 */
                async deleteCard({ id }: { id: string }) {
                    await removeCard(id);
                    return null;
                },

                /**
                 * Inserts given review log data for the given card into the database.
                 *
                 * @param data Task data.
                 * @param data.cardId Card ID.
                 * @param data.logs Array of log data entries.
                 * @returns `null`.
                 */
                async createLogs({
                    cardId,
                    logs,
                }: {
                    cardId: string;
                    logs: (Omit<ReviewLogSeedData, "date"> & { date: string })[];
                }) {
                    for (const log of logs) {
                        await insertLog.execute({
                            cardId,
                            review: new Date(log.date),
                            ratingId: log.rating,
                            // Fake values that do not impact the current statistics screen
                            answerAttempt: "",
                            stateId: 0,
                            due: new Date(log.date),
                            stability: 1,
                            difficulty: 1,
                            elapsedDays: 1,
                            lastElapsedDays: 1,
                            scheduledDays: 1,
                        });
                    }
                    return null;
                },

                /**
                 * Retrieves all review logs from the database.
                 *
                 * @returns Array of logs.
                 */
                async getLogs() {
                    return selectLogs.execute();
                },

                /**
                 * Synchronizes user's deck and overall health to match individual card health values without updating the cards.
                 *
                 * @param data Task data.
                 * @param data.userId User ID.
                 * @returns `null`.
                 */
                async syncHealthByCards({ userId }: { userId: string }) {
                    await updateUserHealthSyncDate(userId, DateTime.now().toJSDate()); // Forcibly set last sync date to current date to avoid automatic synchronization (which would also recalculate card retrievabilities instead of relying on the ones currently in the database)
                    await forceSyncUserHealth(userId);
                    await forceSyncDecksHealth(userId);
                    return null;
                },
            });

            return config;
        },
    },
});
