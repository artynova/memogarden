import { FSRS, generatorParameters } from "ts-fsrs";

/**
 * The retrievability to be assigned to freshly revised cards.
 */
export const retrievabilityAfterReview = 1;

const schedulerParams = generatorParameters();
/**
 * ts-fsrs scheduler instance.
 */
export const scheduler = new FSRS(schedulerParams);
