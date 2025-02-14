/**
 * Re-declaration of the SRS library's card state enum to use on the client without bundling the library.
 */
export enum CardState {
    New = 0,
    Learning = 1,
    Review = 2,
    Relearning = 3,
}

/**
 * Re-declaration of the SRS library's card rating enum to use on the client without bundling the library.
 */
export enum ReviewRating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

/**
 * Health state of any object with "health", individual or aggregated (i.e., cards, decks, and the collection).
 */
export enum HealthState {
    Unknown = 0,
    Withering = 1,
    Neglected = 2,
    Lush = 3,
    FreshlyWatered = 4,
}

/**
 * Enum of maturity states for cards (a combination of the card state and the most recent scheduled days interval).
 * The semantic order of the stages matches the order of their numerical values, so the numerical values can be used
 * for ordering.
 */
export enum CardMaturity {
    Seed = 0,
    Sprout = 1,
    Sapling = 2,
    Budding = 3,
    Mature = 4,
    Mighty = 5,
}
