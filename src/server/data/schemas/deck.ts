import { doublePrecision, pgTable, varchar } from "drizzle-orm/pg-core";
import { userReference } from "@/server/data/schemas/user";
import { autoId, autoIdExternal, timestamps } from "@/server/data/schemas/utils";

/**
 * Deck of flashcards, generally united by some topic.
 */
export const deck = pgTable("deck", {
    id: autoId(),
    ...timestamps,
    userId: userReference().notNull(),
    name: varchar({ length: 100 }).notNull(),
    retrievability: doublePrecision(), // Average retrievability is nullable, absent when there are no individual cards with valid retrievabilities in the deck
});

/**
 * Column builder that configures a reference to a deck entry.
 *
 * @returns Column builder.
 */
export const deckReference = () => autoIdExternal().references(() => deck.id);
