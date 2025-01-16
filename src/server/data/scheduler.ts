import { FSRS, generatorParameters } from "ts-fsrs";

/**
 * Stability value to use for new cards in order to be able to compute their retrievability.
 * This does not take into account difficulty in any way and gets overridden upon first review.
 */
export const newCardStability = 0.1;

const schedulerParams = generatorParameters();
/**
 * ts-fsrs scheduler instance.
 */
export const scheduler = new FSRS(schedulerParams);
