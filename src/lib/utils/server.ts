/**
 * Search parameter as provided to page components by Next.js.
 */
export type SearchParam = string | string[] | undefined;

/**
 * Properties of a page that accepts search parameters.
 */
export interface PageWithSearchParamsProps {
    /**
     * Parameters parsed by Next.js.
     */
    searchParams: Promise<{ [key: string]: SearchParam }>;
}

/**
 * Properties of a page that accepts a path parameter named "id" and shows data associated with a singular resource
 * corresponding to that id.
 */
export interface ResourceSpecificPageProps {
    /**
     * Path parameters.
     */
    params: Promise<{ id: string }>;
}

/**
 * Parses a single string value for a search parameter expected to have such a value.
 *
 * @param param Next.js parameter.
 * @returns Parsed value (first if there were several values provided), or `null` if the parameter's value was missing.
 */
export function parseStringParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    return Array.isArray(param) ? param[0] : param;
}

/**
 * Parses a single integer value for a search parameter expected to have such a value.
 *
 * @param param Next.js parameter.
 * @returns Parsed value (first if there were several values provided), or `null` if the parameter's value was missing
 * or not a number.
 */
export function parseIntParam(param: SearchParam) {
    if (typeof param === "undefined") return null;
    const parsed = parseInt(Array.isArray(param) ? param[0] : param);
    return isNaN(parsed) ? null : parsed;
}
