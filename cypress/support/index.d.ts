/// <reference types="cypress" />

import { CardState, ReviewRating } from "@/lib/enums";
import { card, reviewLog } from "@/server/data/schemas/card";
import { deck } from "@/server/data/schemas/deck";
import { user } from "@/server/data/schemas/user";
import { InferSelectModel } from "drizzle-orm";

/**
 * Data for creating a mock review log in the context of a card. Contains no information about the card.
 */
export interface ReviewLogSeedData {
    /**
     * Review date.
     */
    date: Date;
    /**
     * Review rating.
     */
    rating: ReviewRating;
}

/**
 * Data for creating a mock new card. Contains no information about the deck.
 */
export interface NewCardSeedData {
    /**
     * Raw card front.
     */
    front: string;
    /**
     * Raw card back.
     */
    back: string;
    /**
     * Card state (must be {@link CardState.New} since it is a new card).
     */
    stateId: CardState.New;
    /**
     * Optionally, a list of reviews to simulate after inserting the card data. Reviews will override any metadata properties (state, due date, etc.).
     */
    reviewLogs?: ReviewLogSeedData[];
    /**
     * Optionally, a flag that marks the card for automatic soft deletion after all insertion operations are completed, e.g., to test handling of soft-deleted cards.
     */
    delete?: boolean;
}

/**
 * Data for creating a mock existing card. Contains no information about the deck.
 */
export interface ExistingCardSeedData {
    /**
     * Raw card front.
     */
    front: string;
    /**
     * Raw card back.
     */
    back: string;
    /**
     * Card state (must not be {@link CardState.New} since new cards use a separate input type, {@link NewCardSeedData}).
     */
    stateId: Omit<CardState, CardState.New>;
    /**
     * Card due date.
     */
    due: Date;
    /**
     * Last review date (the card must have it since it is not a new card).
     */
    lastReview: Date;
    /**
     * Scheduling interval in days, important for maturity calculations.
     */
    scheduledDays: number;
    /**
     * Card retrievability from 0 to 1.
     */
    retrievability: number;
    /**
     * Optionally, a list of reviews to simulate after inserting the card data. Reviews will override any metadata properties (state, due date, etc.).
     */
    reviewLogs?: ReviewLogSeedData[];
    /**
     * Optionally, a flag that marks the card for automatic soft deletion after all insertion operations are completed, e.g., to test handling of soft-deleted cards.
     */
    delete?: boolean;
}

/**
 * Data for creating a mock card. Contains no information about the deck.
 */
export type CardSeedData = NewCardSeedData | ExistingCardSeedData;

/**
 * Data for creating a mock deck. Contains no information about the user.
 */
export interface DeckSeedData {
    /**
     * Deck name.
     */
    name: string;
    /**
     * Deck cards (will be inserted after the deck).
     */
    cards: CardSeedData[];
    /**
     * Optionally, a flag that marks the card for automatic soft deletion after all insertion operations are completed, e.g., to test handling of soft-deleted cards.
     */
    delete?: boolean;
}

/**
 * Data for creating a mock user.
 */
export interface UserSeedData {
    /**
     * Email.
     */
    email: string;
    /**
     * Password.
     */
    password: string;
    /**
     * Time zone.
     */
    timezone: string;
    /**
     * Avatar ID.
     */
    avatarId: number;
    /**
     * Dark mode flag.
     */
    darkMode: boolean | null;
    /**
     * User decks (will be inserted after the user account).
     */
    decks: DeckSeedData[];
}

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Clears all database data, e.g., before starting a test.
             */
            cleanupDatabase(): Chainable<void>;

            /**
             * Inserts credentials user data into the database.
             *
             * @param user User data.
             * @returns Chainable with user's ID.
             */
            createCredentialsUser(user: Omit<UserSeedData, "decks">): Chainable<string>;

            /**
             * Signs in with credentials by going through the sign-in form.
             *
             * @param email User email.
             * @param password User password.
             */
            signinWithCredentials(email: string, password: string): Chainable<void>;

            /**
             * Retrieves first user from the database. In the testing environment this is expected
             * to be the only user.
             *
             * @returns Chainable with user's data.
             */
            getUser(): Chainable<InferSelectModel<typeof user> | null>;

            /**
             * Inserts deck data into the database.
             *
             * @param userId User ID.
             * @param deck Deck data.
             * @returns Chainable with deck's ID.
             */
            createDeck(userId: string, deck: Omit<DeckSeedData, "cards">): Chainable<string>;

            /**
             * Retrieves first deck with the exact given name from the database.
             *
             * @param name Deck name.
             * @returns Chainable with deck data if the deck was found, `null` otherwise.
             */
            findDeck(name: string): Chainable<InferSelectModel<typeof deck> | null>;

            /**
             * Soft-deletes the deck with the given ID.
             *
             * @param id Deck ID.
             */
            deleteDeck(id: string): Chainable<void>;

            /**
             * Inserts new card data into the database.
             *
             * @param deckId Deck ID.
             * @param card Card data.
             * @returns Chainable with card's ID.
             */
            createNewCard(
                deckId: string,
                card: Omit<NewCardSeedData, "stateId" | "reviewsToSimulate">,
            ): Chainable<string>;

            /**
             * Inserts existing card data into the database.
             *
             * @param deckId Deck ID.
             * @param card Card data.
             * @returns Chainable with card's ID.
             */
            createCard(
                deckId: string,
                card: Omit<ExistingCardSeedData, "reviewsToSimulate">,
            ): Chainable<string>;

            /**
             * Retrieves first card with the exact given front and back from the database.
             *
             * @param front Card front.
             * @param back Card back.
             * @returns Chainable with card data if the card was found, `null` otherwise.
             */
            findCard(front: string, back: string): Chainable<InferSelectModel<typeof card> | null>;

            /**
             * Soft-deletes the deck with the given ID.
             *
             * @param id Card ID.
             */
            deleteCard(id: string): Chainable<void>;

            /**
             * Inserts given log data associated with the given card into the database.
             *
             * @param cardId Card ID.
             * @param logs Array of log entries.
             */
            createLogs(cardId: string, logs: ReviewLogSeedData[]): Chainable<void>;

            /**
             * Retrieves all review logs from the database.
             *
             * @returns Chainable with review logs array.
             */
            getLogs(): Chainable<InferSelectModel<typeof reviewLog>[]>;

            /**
             * Updates the health of user's decks and overall collection based on card health values. Does not update cards. Used for making
             * aggregate values match individual card values.
             *
             * @param userId User ID.
             */
            syncHealthByCards(userId: string): Chainable<void>;

            /**
             * Seeds database with given user data.
             *
             * @param user User data.
             * @returns Chainable with user's ID.
             */
            seed(user: UserSeedData): Chainable<string>;

            /**
             * Seeds database with given user data and signs into the user's account. Combines {@link seed} and {@link signinWithCredentials}.
             *
             * @param user User data.
             * @returns Chainable with user's ID.
             */
            seedAndSignin(user: UserSeedData): Chainable<string>;
        }
    }
}
