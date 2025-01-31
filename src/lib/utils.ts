import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UrlObject } from "url";
import { DateTime } from "luxon";

export type Url = string | UrlObject;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Helper function to wrap a promise-returning function with a call that explicitly ignores its outputs.
 *
 * @param asyncFn The async function whose output is being ignored.
 */
export function ignoreAsyncFnResult<T extends (...args: Parameters<T>) => Promise<unknown>>(
    asyncFn: T,
) {
    return (...args: Parameters<T>) => {
        void asyncFn(...args);
    };
}

export function escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getTrimmedText(text: string, maxLength: number) {
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

export function getLocaleDateString(date: Date, timezone: string): string {
    return DateTime.fromJSDate(date).setZone(timezone).toLocaleString(DateTime.DATE_SHORT);
}
