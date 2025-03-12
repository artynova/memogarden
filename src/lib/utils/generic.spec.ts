import { escapeRegex, getDayEnd, getUTCDateString, ignoreAsyncFnResult } from "@/lib/utils/generic";
import { describe, expect, test, vi } from "vitest";

describe(ignoreAsyncFnResult, () => {
    describe("given asynchronous function that accepts first string parameter and second number parameter", () => {
        describe.each([
            { first: "test", second: 2 },
            { first: "lorem ipsum", second: 3.14 },
        ])("given first parameter $first and second parameter $second", ({ first, second }) => {
            test("should forward parameters to wrapped function", () => {
                const mockAsyncFn = vi.fn<(param1: string, param2: number) => Promise<void>>(
                    () => new Promise(() => {}),
                );

                const fn = ignoreAsyncFnResult(mockAsyncFn);
                fn(first, second);

                expect(mockAsyncFn).toHaveBeenCalledExactlyOnceWith(first, second);
            });
        });
    });
});

describe(escapeRegex, () => {
    test("should escape only special regex characters", () => {
        const input = "a*a+a?a^a$a{a}a(a)a|a[a]a\\a";

        const output = escapeRegex(input);

        expect(output).toEqual("a\\*a\\+a\\?a\\^a\\$a\\{a\\}a\\(a\\)a\\|a\\[a\\]a\\\\a");
    });
});

describe(getDayEnd, () => {
    describe.each([
        {
            date: new Date("2020-05-02T06:00:00.000Z"),
            timezone: "America/New_York",
            expected: new Date("2020-05-03T03:59:59.999Z"),
        },
        {
            date: new Date("2020-05-02T03:00:00.000Z"),
            timezone: "Europe/Berlin",
            expected: new Date("2020-05-02T21:59:59.999Z"),
        },
    ])("given date $date and time zone $timezone", ({ date, timezone, expected }) => {
        test(`should return date ${expected.toISOString()}`, () => {
            const output = getDayEnd(date, timezone);

            expect(output).toEqual(expected);
        });
    });
});

describe(getUTCDateString, () => {
    describe.each([
        { date: new Date("2020-03-04T16:49:15.500Z"), expected: "2020-03-04" },
        { date: new Date("2023-09-30T00:35:34.200Z"), expected: "2023-09-30" },
        { date: new Date("2019-01-12T23:53:25.700Z"), expected: "2019-01-12" },
    ])("given date $date", ({ date, expected }) => {
        test(`should return ISO date string '${expected}'`, () => {
            const output = getUTCDateString(date);

            expect(output).toEqual(expected);
        });
    });
});
