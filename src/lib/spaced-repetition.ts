import { CardSeed } from "@/components/ui/icons/card-seed";
import { CardSprout } from "@/components/ui/icons/card-sprout";
import { CardSapling } from "@/components/ui/icons/card-sapling";
import { CardBudding } from "@/components/ui/icons/card-budding";
import { CardMature } from "@/components/ui/icons/card-mature";
import { CardMighty } from "@/components/ui/icons/card-mighty";
import { ElementType } from "react";

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

export const MID_MATURITY_THRESHOLD = 16;
export const HIGH_MATURITY_THRESHOLD = 31;
export const MAX_MATURITY_THRESHOLD = 62;

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

export type CardMaturityCounts = {
    [K in CardMaturity]: number;
};

/**
 * Determines a card's maturity based on its revision state and the last scheduled interval in days.
 *
 * @param state Card's state.
 * @param scheduledDays Last scheduled interval in days.
 */
export function getCardMaturity(state: CardState, scheduledDays: number) {
    if (state === CardState.New) return CardMaturity.Seed;
    if (state === CardState.Learning || state === CardState.Relearning) return CardMaturity.Sprout;
    // At this point we know that the state is Review
    if (scheduledDays < MID_MATURITY_THRESHOLD) return CardMaturity.Sapling;
    if (scheduledDays < HIGH_MATURITY_THRESHOLD) return CardMaturity.Budding;
    if (scheduledDays < MAX_MATURITY_THRESHOLD) return CardMaturity.Mature;
    return CardMaturity.Mighty;
}

export interface CardMaturityRenderData {
    icon: ElementType<{ className?: string | undefined }>;
    name: string;
}

export const cardMaturities: CardMaturityRenderData[] = [
    {
        icon: CardSeed,
        name: "Seed",
    },
    {
        icon: CardSprout,
        name: "Sprout",
    },
    {
        icon: CardSapling,
        name: "Sapling",
    },
    {
        icon: CardBudding,
        name: "Budding",
    },
    {
        icon: CardMature,
        name: "Mature",
    },
    {
        icon: CardMighty,
        name: "Mighty",
    },
];
