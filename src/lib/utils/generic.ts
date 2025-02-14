import { UrlObject } from "url";
import { DateTime } from "luxon";
import { SelectUser } from "@/server/data/services/user";

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
 * Trims a string down to a specific max character length.
 *
 * @param text Text string.
 * @param maxLength Maximum allowed number of characters.
 * @returns String itself if it is within the character boundary, trimmed string with "..." after it
 * if it exceeds the allowed length.
 */
export function getTrimmedText(text: string, maxLength: number) {
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

/**
 * Converts a JavaScript date to a date-only string that uses locale formatting, with the calendar
 * date determined based on the given timezone.
 *
 * @param date Date.
 * @param timezone Timezone.
 * @returns Converted locale date string.
 */
export function getLocaleDateString(date: Date, timezone: string): string {
    return DateTime.fromJSDate(date).setZone(timezone).toLocaleString(DateTime.DATE_SHORT);
}

/**
 * Gets the JavaScript date representing the end of the calendar date on which the given base date
 * falls in the given user's timezone.
 *
 * @param user User.
 * @param date Base date.
 * @returns End-of-day date.
 */
export function getUserDayEnd(user: SelectUser, date: Date) {
    return DateTime.fromJSDate(date).setZone(user.timezone).endOf("day").toJSDate();
}
