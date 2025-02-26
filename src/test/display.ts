/**
 * Stringifies the given object as a JSON object in a single line (without newlines) but with single spaces added for readability.
 *
 * @param input Value to stringify.
 * @returns Stringified representation.
 */
export function stringifyWithSingleSpaces(input: unknown) {
    return JSON.stringify(input, null, 1).replace(/\s+/g, () => " ");
}
