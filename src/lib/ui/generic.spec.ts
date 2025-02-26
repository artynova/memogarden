import { getLocaleDateString, getLocaleDateStringConcise, getTrimmedText } from "@/lib/ui/generic";
import { describe, expect, test } from "vitest";

describe(getTrimmedText, () => {
    test.each([
        { text: "abcde", limit: 7, expected: "abcde" },
        { text: "abcdefg", limit: 7, expected: "abcdefg" },
        { text: "abcdefgh", limit: 7, expected: "abcd..." },
    ])("should return $expected for input $text", ({ text, limit, expected }) => {
        const output = getTrimmedText(text, limit);

        expect(output).toEqual(expected);
    });
});

describe(getLocaleDateString, () => {
    test.each([
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T06:00:00.000Z"),
            expected: "May 2, 2020",
        },
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T03:00:00.000Z"),
            expected: "May 1, 2020",
        },
    ])(
        "should return $expected with input timezone $timezone and date $date",
        ({ timezone, date, expected }) => {
            const output = getLocaleDateString(date, timezone);

            expect(output).toEqual(expected);
        },
    );
});

describe(getLocaleDateStringConcise, () => {
    test.each([
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T06:00:00.000Z"),
            expected: "May 2",
        },
        {
            timezone: "America/New_York",
            date: new Date("2020-05-02T03:00:00.000Z"),
            expected: "May 1",
        },
    ])(
        "should return $expected with input timezone $timezone and date $date",
        ({ timezone, date, expected }) => {
            const output = getLocaleDateStringConcise(date, timezone);

            expect(output).toEqual(expected);
        },
    );
});
