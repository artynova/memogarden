/**
 * Health state of any object with "health", individual or aggregated (i.e., cards, decks, and the collection).
 */
export enum HealthState {
    Withering = 0,
    Wilting = 1,
    Thirsty = 2,
    Vibrant = 3,
}

/**
 * Minimum retrievability thresholds (in %) to assign specific health values.
 */
export const minRetrievabilityForHealth = {
    [HealthState.Withering]: 0,
    [HealthState.Wilting]: 40,
    [HealthState.Thirsty]: 80,
    [HealthState.Vibrant]: 90,
};

/**
 * Converts retrievability to the respective discrete health state.
 *
 * @param retrievability Retrievability between 0 and 1.
 * @return Health state corresponding to the given retrievability.
 */
export function toHealthState(retrievability: number): HealthState {
    if (retrievability >= minRetrievabilityForHealth[HealthState.Vibrant])
        return HealthState.Vibrant;
    if (retrievability >= minRetrievabilityForHealth[HealthState.Thirsty])
        return HealthState.Thirsty;
    if (retrievability >= minRetrievabilityForHealth[HealthState.Wilting])
        return HealthState.Wilting;
    return HealthState.Withering;
}

/**
 * Information about health state progress for any object with retrievability data.
 */
export interface HealthProgress {
    /**
     * Current health state.
     */
    state: HealthState;
    /**
     * Progress ratio between 0 (no progress, the current health state has just been reached) and 1 (full 100%
     * progress). In practice, this can only have a value of 1 if the health state is Vibrant, since for other health
     * states having 100% progress in them is equivalent to having 0% progress in the next, better health state, and
     * the better health state is prioritized.
     */
    progressRatio: number;
}

/**
 * Returns the current health state and the progress ratio from that state to the next one.
 *
 * @param retrievability Retrievability between 0 and 1.
 * @return Health state progress information.
 */
export function getHealthProgress(retrievability: number): HealthProgress {
    const state = toHealthState(retrievability);
    const minHealthRetrievability = minRetrievabilityForHealth[state];
    const maxHealthRetrievabilityExclusive =
        state === HealthState.Vibrant ? 1 : minRetrievabilityForHealth[(state + 1) as HealthState]; // When the health state is Vibrant, healthState + 1 would be out of bounds for the enum, but that value is handled explicitly as an edge case, so the cast is safe
    return {
        state,
        progressRatio:
            (retrievability - minHealthRetrievability) /
            (maxHealthRetrievabilityExclusive - minHealthRetrievability),
    };
}
