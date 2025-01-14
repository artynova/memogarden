import { bgFineClass, bgProblemClass, bgUnimportantClass, bgWarningClass } from "@/lib/ui";

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
 * Minimum retrievability thresholds (in %) to assign specific health values.
 */
export const minRetrievabilityForHealth = {
    [HealthState.Withering]: 0,
    [HealthState.Neglected]: 40,
    [HealthState.Lush]: 90,
    [HealthState.FreshlyWatered]: 100,
};

export const colorForHealth = {
    [HealthState.Unknown]: bgUnimportantClass,
    [HealthState.Withering]: bgProblemClass,
    [HealthState.Neglected]: bgWarningClass,
    [HealthState.Lush]: bgFineClass,
    [HealthState.FreshlyWatered]: bgFineClass,
};

export const nameForHealth = {
    [HealthState.Unknown]: "Not Yet Planted",
    [HealthState.Withering]: "Withering",
    [HealthState.Neglected]: "Neglected",
    [HealthState.Lush]: "Lush",
    [HealthState.FreshlyWatered]: "Freshly Watered",
};

/**
 * Converts retrievability to the respective discrete health state.
 *
 * @param retrievability Retrievability integer between 0 and 100, or `null` if the object does not have a definite
 * health value (e.g., it is a Seed card).
 * @return Health state corresponding to the given retrievability.
 */
export function toHealthState(retrievability: number | null): HealthState {
    if (retrievability === null) return HealthState.Unknown;
    if (retrievability >= minRetrievabilityForHealth[HealthState.FreshlyWatered])
        return HealthState.FreshlyWatered;
    if (retrievability >= minRetrievabilityForHealth[HealthState.Lush]) return HealthState.Lush;
    if (retrievability >= minRetrievabilityForHealth[HealthState.Neglected])
        return HealthState.Neglected;
    return HealthState.Withering;
}
