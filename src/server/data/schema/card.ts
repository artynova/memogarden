import { doublePrecision, integer, pgTable, smallint, varchar } from "drizzle-orm/pg-core";
import { autoId, autoIdExternal, timestamps, timestampTz } from "@/server/data/schema/utils";
import { deckReference } from "@/server/data/schema/deck";

/**
 * Decoupled lookup table for card state enum values, allowing to attach metadata (like arbitrary names).
 */
export const cardState = pgTable("card_state", {
    id: smallint().primaryKey(), // Corresponds to the card state enum value
    name: varchar({ length: 30 }).notNull(),
});

/**
 * Column builder that configures a reference to a card state lookup entry.
 */
export const cardStateReference = () => smallint().references(() => cardState.id);

/**
 * Decoupled lookup table for card review rating enum values, allowing to attach metadata (like arbitrary names).
 */
export const reviewRating = pgTable("review_rating", {
    id: smallint().primaryKey(), // Corresponds to the card rating enum value
    name: varchar({ length: 30 }).notNull(),
});

/**
 * Column builder that configures a reference to a review rating lookup entry.
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
    due: timestampTz().notNull(),
    stability: doublePrecision().notNull(),
    difficulty: doublePrecision().notNull(),
    elapsedDays: integer().notNull(),
    scheduledDays: integer().notNull(),
    reps: integer().notNull(),
    lapses: integer().notNull(),
    stateId: reviewRatingReference().notNull(),
    lastReview: timestampTz(),
    retrievability: doublePrecision(), // Nullable, absent if the card is new (has not yet been reviewed) because judgements about retrievability cannot be made before the first review
});

/**
 * Column builder that configures a reference to a card entry.
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
