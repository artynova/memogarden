import { UrlObject } from "url";
import { DateTime } from "luxon";

/**
 * URL as accepted by Next.js links.
 */
export type Url = string | UrlObject;

/**
 * Helper to wrap an asynchronous function and ignore the returned promise in a type-safe way,
 * essentially "calling and forgetting" it.
 *
 * @param asyncFn Async function whose output is to be ignored.
 * @returns Synchronous function with the same parameters as the asynchronous input function,
 * returning nothing.
 */
export function ignoreAsyncFnResult<T extends (...args: Parameters<T>) => Promise<unknown>>(
    asyncFn: T,
) {
    return (...args: Parameters<T>) => {
        void asyncFn(...args);
    };
}

/**
 * Escapes special regex characters in a string to allow it to be matched literally within regex
 * expressions.
 *
 * @param input String, potentially with special regex characters such as ".".
 * @returns String where all special characters are escaped and thus treated as literal characters.
 */
export function escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Gets the JavaScript date representing the end of the calendar date on which the given base date
 * falls in the given timezone.
 *
 * @param date Base date.
 * @param timezone IANA timezone string.
 * @returns End-of-day date.
 */
export function getDayEnd(date: Date, timezone: string) {
    return DateTime.fromJSDate(date).setZone(timezone).endOf("day").toJSDate();
}
/**
 * Gets the ISO date string component of a given date in the UTC timezone.
 *
 * @param date Date.
 * @returns Date string.
 */
export function getUTCDateString(date: Date) {
    return date.toISOString().split("T")[0];
}
