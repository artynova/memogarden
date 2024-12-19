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
