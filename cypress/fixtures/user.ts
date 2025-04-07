import { CardState, ReviewRating } from "@/lib/enums";
import { DateTime } from "luxon";

/**
 * Sample existing user data.
 */
export const userMain = {
    email: "user@example.com",
    password: "AAaa11!!",
    timezone: "Europe/Warsaw",
    avatarId: 1,
    darkMode: true,
    new: 1,
    learning: 2,
    review: 23,
    retrievabilityPercent: 65,
    cardCount: 26,
    decks: [
        {
            name: "German",
            new: 0,
            learning: 1,
            review: 1,
            retrievabilityPercent: 90,
            cards: [
                {
                    front: "**Hallo**",
                    back: "*Hello*",
                    due: new Date(),
                    lastReview: DateTime.now().minus({ minutes: 1 }).toJSDate(),
                    stateId: CardState.Learning,
                    scheduledDays: 0,
                    retrievability: 1,
                },
                {
                    front: "Guten Tag",
                    back: "Good day",
                    due: DateTime.now().minus({ days: 1 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 5 }).toJSDate(),
                    stateId: CardState.Review,
                    scheduledDays: 4,
                    retrievability: 0.8,
                },
            ],
        },
        {
            name: "Polish",
            new: 1,
            learning: 0,
            review: 0,
            retrievabilityPercent: 100,
            cards: [
                {
                    front: "Cześć",
                    back: "Hello",
                    stateId: CardState.New as const,
                },
            ],
        },
        {
            name: "Japanese",
            new: 0,
            learning: 0,
            review: 0,
            retrievabilityPercent: null,
            cards: [],
        },
        {
            name: "Filler deck",
            new: 0,
            learning: 1,
            review: 22,
            retrievabilityPercent: 62,
            cards: [
                ...Array.from({ length: 22 }, (_, index) => ({
                    front: `Filler ${index + 1}`,
                    back: "Lorem ipsum",
                    due: DateTime.now().minus({ days: 2 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 7 }).toJSDate(),
                    stateId: CardState.Review,
                    scheduledDays: 5,
                    retrievability: 0.6,
                })),
                {
                    front: "Other",
                    back: "Lorem ipsum",
                    due: new Date(),
                    lastReview: DateTime.now().minus({ minutes: 1 }).toJSDate(),
                    stateId: CardState.Relearning,
                    scheduledDays: 0,
                    retrievability: 1,
                },
            ],
        },
    ],
};

/**
 * Sample user data for testing the statistics view. Contains mock review data.
 */
export const userStats = {
    email: "user-stats@example.com",
    password: "11!!AAaa",
    timezone: "Europe/Warsaw",
    avatarId: 2,
    darkMode: true,
    retrievabilityPercent: 95,
    decks: [
        {
            name: "German",
            cards: [
                {
                    front: "**Hallo**",
                    back: "*Hello*",
                    stateId: CardState.Review as const,
                    due: DateTime.now().plus({ days: 15 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 2 }).toJSDate(),
                    scheduledDays: 17,
                    retrievability: 0.99,
                    reviewLogs: [
                        {
                            date: DateTime.now().minus({ days: 5, minutes: 1 }).toJSDate(),
                            rating: ReviewRating.Again,
                        },
                        {
                            date: DateTime.now().minus({ days: 5 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 2 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                    ],
                },
                {
                    front: "Guten Tag",
                    back: "Good day",
                    stateId: CardState.Relearning as const,
                    due: DateTime.now().minus({ days: 5 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 5 }).toJSDate(),
                    scheduledDays: 0,
                    retrievability: 0.84,
                    reviewLogs: [
                        {
                            date: DateTime.now().minus({ days: 8, minutes: 1 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 5 }).toJSDate(),
                            rating: ReviewRating.Again,
                        },
                    ],
                },
                {
                    delete: true,
                    front: "Danke",
                    back: "Thanks",
                    stateId: CardState.Review as const,
                    due: DateTime.now().plus({ days: 52 }).toJSDate(),
                    lastReview: DateTime.now().minus({ minutes: 1 }).toJSDate(),
                    scheduledDays: 52,
                    retrievability: 1,
                    reviewLogs: [
                        {
                            date: DateTime.now().minus({ days: 4 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ minutes: 1 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                    ],
                },
            ],
        },
        {
            name: "Polish",
            cards: [
                {
                    front: "Cześć",
                    back: "Hello",
                    stateId: CardState.Review as const,
                    due: DateTime.now().plus({ days: 142 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 1 }).toJSDate(),
                    scheduledDays: 143,
                    retrievability: 0.98,
                    reviewLogs: [
                        {
                            date: DateTime.now().minus({ days: 40 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 36 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 26 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 15 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 1 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                    ],
                },

                {
                    front: "Bardzo",
                    back: "Very",
                    stateId: CardState.New as const,
                },
            ],
        },
        {
            delete: true,
            name: "Japanese",
            cards: [
                {
                    front: "今日は",
                    back: "Good day",
                    stateId: CardState.Review as const,
                    due: DateTime.now().plus({ days: 69 }).toJSDate(),
                    lastReview: DateTime.now().minus({ days: 1 }).toJSDate(),
                    scheduledDays: 70,
                    retrievability: 1,
                    reviewLogs: [
                        {
                            date: DateTime.now().minus({ days: 15, minutes: 1 }).toJSDate(),
                            rating: ReviewRating.Good,
                        },
                        {
                            date: DateTime.now().minus({ days: 15 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 10 }).toJSDate(),
                            rating: ReviewRating.Easy,
                        },
                        {
                            date: DateTime.now().minus({ days: 1 }).toJSDate(),
                            rating: ReviewRating.Good,
                        },
                    ],
                },
            ],
        },
    ],
};
