import {
    bgFineClass,
    bgFineForegroundClass,
    bgProblemClass,
    bgProblemForegroundClass,
    bgUnimportantClass,
    bgUnimportantForegroundClass,
    bgWarningClass,
    bgWarningForegroundClass,
} from "@/lib/ui/tailwind";
import { HealthState } from "@/lib/enums";

/**
 * Minimum retrievability thresholds (in %) to assign specific health values.
 */
export const minRetrievabilityForHealth = {
    [HealthState.Withering]: 0,
    [HealthState.Neglected]: 40,
    [HealthState.Lush]: 90,
    [HealthState.FreshlyWatered]: 100,
};

/**
 * Mapping of resource health states to associated "front" background colors (e.g., on the health
 * bar).
 */
export const bgForegroundForHealth = {
    [HealthState.Unknown]: bgUnimportantForegroundClass,
    [HealthState.Withering]: bgProblemForegroundClass,
    [HealthState.Neglected]: bgWarningForegroundClass,
    [HealthState.Lush]: bgFineForegroundClass,
    [HealthState.FreshlyWatered]: bgFineForegroundClass,
};

/**
 * Mapping of resource health states to associated "back" background colors (e.g., on the health
 * bar).
 */
export const bgForHealth = {
    [HealthState.Unknown]: bgUnimportantClass,
    [HealthState.Withering]: bgProblemClass,
    [HealthState.Neglected]: bgWarningClass,
    [HealthState.Lush]: bgFineClass,
    [HealthState.FreshlyWatered]: bgFineClass,
};

/**
 * Names for card health states.
 */
export const nameForHealth = {
    [HealthState.Unknown]: "Not yet planted",
    [HealthState.Withering]: "Withering",
    [HealthState.Neglected]: "Neglected",
    [HealthState.Lush]: "Lush",
    [HealthState.FreshlyWatered]: "Freshly watered",
};

/**
 * Converts retrievability to the respective discrete health state.
 *
 * @param retrievabilityPercent Integer retrievability percentage between 0 and 100, or `null` if the object does not
 * have a definite health value (e.g., it is a Seed card).
 * @returns Health state corresponding to the given retrievability.
 */
export function toHealthState(retrievabilityPercent: number | null): HealthState {
    if (retrievabilityPercent === null) return HealthState.Unknown;
    if (retrievabilityPercent >= minRetrievabilityForHealth[HealthState.FreshlyWatered])
        return HealthState.FreshlyWatered;
    if (retrievabilityPercent >= minRetrievabilityForHealth[HealthState.Lush])
        return HealthState.Lush;
    if (retrievabilityPercent >= minRetrievabilityForHealth[HealthState.Neglected])
        return HealthState.Neglected;
    return HealthState.Withering;
}
