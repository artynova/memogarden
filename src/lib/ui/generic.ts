import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ElementType } from "react";

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
