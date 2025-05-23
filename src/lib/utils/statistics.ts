import { CardMaturity } from "@/lib/enums";
import { DateTime } from "luxon";
import { getUTCDateString } from "@/lib/utils/generic";

/**
 * Data about how many reviews are associated with a specific date (represented as a date string).
 */
export type DateRevisionStats = {
    /**
     * Date part of the ISO string representation.
     */
    date: string;
    /**
     * Number of reviews.
     */
    reviews: number;
};

/**
 * Sparse data about how many reviews are associated with specific dates over a certain
 * time interval. Dates that are within the interval but absent from the mapping have 0 associated
 * reviews.
 */
export type SparseDatesReviews = Record<string, number>;

/**
 * Data about how many reviews are associated with a specific date.
 */
export type DailyReviewsEntry = {
    /**
     * Date.
     */
    date: Date;
    /**
     * Number of reviews.
     */
    reviews: number;
};

/**
 * How many days into the past should review retrospection go.
 */
export const RETROSPECTION_LIMIT = 30;

/**
 * How many days into the future should review prediction go.
 */
export const PREDICTION_LIMIT = 30;

/**
 * Converts the list of date-review-count entries to a sparse date-review-count mapping.
 *
 * @param data Array of entries.
 * @returns Sparse date reviews.
 */
export function toSparseDatesReviews(data: DateRevisionStats[]) {
    return data.reduce<SparseDatesReviews>((acc, { date, reviews }) => {
        acc[getUTCDateString(new Date(date))] = reviews;
        return acc;
    }, {});
}

/**
 * Generates an array of date-to-review-count entries starting in the past and ending at the given date in the specified
 * IANA timezone. Dates not present in the mapping are assumed to have a review count of 0. The number of dates is
 * determined by the {@link RETROSPECTION_LIMIT}.
 *
 * @param timezone The IANA timezone string (e.g., "America/New_York").
 * @param date Desired date.
 * @param sparseDatesToReviews Sparse mapping of ISO date strings to review counts.
 * @returns List of date entries, with each entry containing the date and the number of reviews on it.
 */
export function getPastRevisionsDates(
    timezone: string,
    date: Date,
    sparseDatesToReviews: SparseDatesReviews,
) {
    const todayInTimezone = DateTime.fromJSDate(date).setZone(timezone).startOf("day");
    return Array.from({ length: RETROSPECTION_LIMIT }, (_, i) => {
        const date = todayInTimezone.minus({ days: RETROSPECTION_LIMIT - 1 - i }).toJSDate();
        return { date, reviews: sparseDatesToReviews[getUTCDateString(date)] ?? 0 }; // Assume 0 revisions if data for a date is not present
    });
}

/**
 * Generates an array of date-to-review-count entries starting at the given date and ending in the future in the
 * specified IANA timezone. Dates not present in the mapping are assumed to have a review count of 0. The number of
 * dates is determined by the {@link PREDICTION_LIMIT}. Considers overdue cards (due before today) as due today.
 *
 * @param timezone The IANA timezone string (e.g., "America/New_York").
 * @param date Desired date.
 * @param sparseDatesToReviews Sparse mapping of ISO date strings to review counts.
 * @returns List of date entries, with each entry containing the date and the number of reviews on it.
 */
export function getFutureRevisionsDates(
    timezone: string,
    date: Date,
    sparseDatesToReviews: SparseDatesReviews,
) {
    const todayInTimezone = DateTime.fromJSDate(date).setZone(timezone).startOf("day");
    const todayUTCDate = getUTCDateString(todayInTimezone.toJSDate());
    const prediction = Array.from({ length: PREDICTION_LIMIT }, (_, i) => {
        const date = todayInTimezone.plus({ days: i }).toJSDate();
        return { date, reviews: sparseDatesToReviews[getUTCDateString(date)] ?? 0 }; // Assume 0 revisions if data for a date is not present
    });
    const overdue = Object.entries(sparseDatesToReviews).reduce((acc, [date, reviews]) => {
        return date < todayUTCDate ? acc + reviews : acc;
    }, 0);
    prediction[0].reviews += overdue;
    return prediction;
}

/**
 * Data about how many cards are associated with a specific maturity stage.
 */
export type MaturityCountsEntry = {
    /**
     * Maturity state.
     */
    maturity: CardMaturity;
    /**
     * Number of associated cards.
     */
    cards: number;
};
