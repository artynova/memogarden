import { CardMaturity, CardState } from "@/lib/enums";

/**
 * Minimum review interval required for the fourth maturity stage (the second one that has a review interval threshold).
 */
export const MID_MATURITY_THRESHOLD = 16;

/**
 * Minimum review interval required for the fifth maturity stage (the third one that has a review interval threshold).
 */
export const HIGH_MATURITY_THRESHOLD = 31;

/**
 * Minimum review interval required for the sixth maturity stage (the fourth one that has a review interval threshold).
 */
export const MAX_MATURITY_THRESHOLD = 62;

/**
 * Determines a card's maturity based on its revision state and the current scheduled interval in days.
 *
 * @param state Card's state.
 * @param scheduledDays Scheduled interval in days.
 * @returns Card's maturity.
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
