import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ElementType } from "react";
import { DateTime } from "luxon";

/**
 * Concatenates Tailwind class values.
 *
 * @param inputs Class values.
 * @returns Concatenated class string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generic functional component type used for passing icon components (both from libraries and custom MemoGarden icons).
 * Styling is done via CSS, so this type is only for exposing properties that cannot be configured via CSS.
 */
export type GenericIconType = ElementType<{
    /**
     * Aria label of the icon.
     */
    "aria-label": string | undefined;
}>;

/**
 * Trims a string down to a specific max character length, replacing the rest with an ellipsis at the end if allowed
 * length is exceeded.
 *
 * @param text Text string.
 * @param maxLength Maximum allowed number of characters in the final string (with or without the ellipsis).
 * @returns String itself if it is up to `maxLength` characters, string trimmed down to `maxLength - 3` characters with
 * "..." after it if the string is longer than `maxLength` characters.
 */
export function getTrimmedText(text: string, maxLength: number) {
    return text.length <= maxLength ? text : text.slice(0, maxLength - 3) + "...";
}

/**
 * Locale to be used for formatting dates in the app.
 */
export const appDateFormatLocale = "en-US";

/**
 * Converts a JavaScript date to a date-only string that uses locale formatting, with the calendar
 * date determined based on the given timezone.
 *
 * @param date Date.
 * @param timezone Timezone.
 * @returns Converted locale date string.
 */
export function getLocaleDateString(date: Date, timezone: string): string {
    return DateTime.fromJSDate(date)
        .setZone(timezone)
        .toLocaleString(
            { day: "numeric", month: "short", year: "numeric" },
            { locale: appDateFormatLocale },
        );
}

/**
 * Converts a JavaScript date to a date-only string that uses locale formatting, with the calendar
 * date determined based on the given timezone, without specifying the year (e.g., for cases where the year is easily understood from the context and
 * can be omitted for brevity).
 *
 * @param date Date.
 * @param timezone Timezone.
 * @returns Converted locale date string.
 */
export function getLocaleDateStringConcise(date: Date, timezone: string): string {
    return DateTime.fromJSDate(date)
        .setZone(timezone)
        .toLocaleString({ day: "numeric", month: "short" }, { locale: appDateFormatLocale });
}
