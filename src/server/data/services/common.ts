export function takeFirstOrNull<T>(values: T[]): T | null {
    if (values.length < 1) return null;
    return values[0];
}
