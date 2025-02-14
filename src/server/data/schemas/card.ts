import { doublePrecision, integer, pgTable, smallint, varchar } from "drizzle-orm/pg-core";
import { autoId, autoIdExternal, timestamps, timestampTz } from "@/server/data/schemas/utils";
import { deckReference } from "@/server/data/schemas/deck";
import { newCardStability } from "@/server/data/scheduler";

/**
 * Decoupled lookup table for card state enum values.
 */
export const cardState = pgTable("card_state", {
    id: smallint().primaryKey(), // Corresponds to the card state enum value
});

/**
 * Column builder that configures a reference to a card state lookup entry.
 *
 * @returns Column builder.
 */
export const cardStateReference = () => smallint().references(() => cardState.id);

/**
 * Decoupled lookup table for card review rating enum values.
 */
export const reviewRating = pgTable("review_rating", {
    id: smallint().primaryKey(), // Corresponds to the card rating enum value
});

/**
 * Column builder that configures a reference to a review rating lookup entry.
 *
 * @returns Column builder.
 */
export const reviewRatingReference = () => smallint().references(() => reviewRating.id);

/**
 * Flashcard, with both user-defined data (like front and back text) and app-managed SRS metadata (like the next
 * review date), as well as the stored retrievability value for the day.
 */
export const card = pgTable("card", {
    id: autoId(),
    ...timestamps,
    deckId: deckReference().notNull(),
    front: varchar({ length: 300 }).notNull(),
    back: varchar({ length: 1000 }).notNull(),
    due: timestampTz().notNull().defaultNow(),
    stability: doublePrecision().notNull().default(newCardStability),
    difficulty: doublePrecision().notNull().default(0),
    elapsedDays: integer().notNull().default(0),
    scheduledDays: integer().notNull().default(0),
    reps: integer().notNull().default(0),
    lapses: integer().notNull().default(0),
    stateId: cardStateReference().notNull().default(0), // State with index 0 is guaranteed to exist because it is part of an internal lookup table and not a user-managed record
    lastReview: timestampTz(),
    retrievability: doublePrecision().notNull().default(1), // Initialized to 1 because the user most likely can remember the card right after they have created it
});

/**
 * Column builder that configures a reference to a card entry.
 *
 * @returns Column builder.
 */
export const cardReference = () => autoIdExternal().references(() => card.id);

/**
 * Review log, containing information about a specific review of a specific card. Besides the information returned
 * by ts-fsrs, it also contains the answer attempt input by the user.
 */
export const reviewLog = pgTable("review_log", {
    id: autoId(),
    cardId: cardReference().notNull(),
    answerAttempt: varchar({ length: 1000 }).notNull(), // The user's attempt to reproduce the card's back in this review, used for maintaining accountability. May be an empty string
    ratingId: reviewRatingReference().notNull(),
    stateId: cardStateReference().notNull(),
    due: timestampTz().notNull(),
    stability: doublePrecision().notNull(),
    difficulty: doublePrecision().notNull(),
    elapsedDays: integer().notNull(),
    lastElapsedDays: integer().notNull(),
    scheduledDays: integer().notNull(),
    review: timestampTz().notNull(),
});
