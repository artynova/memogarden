/**
 * Casts an object to the specified (or inferred) type to avoid compiler errors without actually needing it to comply with the type.
 * Only intended for testing.
 *
 * @param actual Actual value (e.g., partial object with only fields of interest).
 * @returns Actual value cast as {@link T} if the actual value is provided. Empty object cast as {@link T} otherwise.
 */
export function fakeCompliantValue<T>(actual: unknown = {}) {
    return actual as T;
}
