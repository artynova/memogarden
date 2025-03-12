import { getLocaleDateString, getLocaleDateStringConcise, getTrimmedText } from "@/lib/ui/generic";
import { describe, expect, test } from "vitest";

describe(getTrimmedText, () => {
    describe.each([
        { text: "abcde", limit: 7, expected: "abcde" },
        { text: "abcdefg", limit: 7, expected: "abcdefg" },
        { text: "abcdefgh", limit: 7, expected: "abcd..." },
    ])("given input $text and character limit $limit", ({ text, limit, expected }) => {
        test(`should return ${expected}`, () => {
            const output = getTrimmedText(text, limit);

            expect(output).toEqual(expected);
        });
    });
});

describe(getLocaleDateString, () => {
    describe.each([
        {
            date: new Date("2020-05-02T06:00:00.000Z"),
            timezone: "America/New_York",
            expected: "May 2, 2020",
        },
        {
            date: new Date("2020-05-02T03:00:00.000Z"),
            timezone: "America/New_York",
            expected: "May 1, 2020",
        },
    ])("given date $date and time zone $timezone", ({ date, timezone, expected }) => {
        test(`should return ${expected}`, () => {
            const output = getLocaleDateString(date, timezone);

            expect(output).toEqual(expected);
        });
    });
});

describe(getLocaleDateStringConcise, () => {
    describe.each([
        {
            date: new Date("2020-05-02T06:00:00.000Z"),
            timezone: "America/New_York",
            expected: "May 2",
        },
        {
            date: new Date("2020-05-02T03:00:00.000Z"),
            timezone: "America/New_York",
            expected: "May 1",
        },
    ])("given date $date and time zone $timezone", ({ date, timezone, expected }) => {
        test(`should return ${expected}`, () => {
            const output = getLocaleDateStringConcise(date, timezone);

            expect(output).toEqual(expected);
        });
    });
});
