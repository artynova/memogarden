import { escapeRegex, getDayEnd, getUTCDateString, ignoreAsyncFnResult } from "@/lib/utils/generic";
import { describe, expect, test, vi } from "vitest";

describe(ignoreAsyncFnResult, () => {
    test("should forward input parameters to the wrapped promise-returning function", () => {
        const mockAsyncFn = vi.fn<(param1: string, param2: number) => Promise<void>>(
            () => new Promise(() => {}),
        );

        const fn = ignoreAsyncFnResult(mockAsyncFn);
        fn("test1", 2);

        expect(mockAsyncFn).toHaveBeenCalledExactlyOnceWith("test1", 2);
    });
});

describe(escapeRegex, () => {
    test("should escape regex special characters while leaving other characters untouched", () => {
        const input = "a*a+a?a^a$a{a}a(a)a|a[a]a\\a";

        const output = escapeRegex(input);

        expect(output).toEqual("a\\*a\\+a\\?a\\^a\\$a\\{a\\}a\\(a\\)a\\|a\\[a\\]a\\\\a");
    });
});

describe(getDayEnd, () => {
    test.each([
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T06:00:00.000Z"),
            expected: new Date("2020-05-03T03:59:59.999Z"),
        },
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T03:00:00.000Z"),
            expected: new Date("2020-05-02T03:59:59.999Z"),
        },
    ])(
        "should return $expected with input timezone $timezone and date $date",
        ({ timezone, date, expected }) => {
            const output = getDayEnd(date, timezone);

            expect(output).toEqual(expected);
        },
    );
});

describe(getUTCDateString, () => {
    test.each([
        { date: new Date("2020-03-04T16:49:15.500Z"), expected: "2020-03-04" },
        { date: new Date("2023-09-30T00:35:34.200Z"), expected: "2023-09-30" },
        { date: new Date("2019-01-12T23:53:25.700Z"), expected: "2019-01-12" },
    ])("should return ISO date string $expected for input $date", ({ date, expected }) => {
        const output = getUTCDateString(date);

        expect(output).toEqual(expected);
    });
});
