import { describe, expect, test } from "vitest";
import {
    toSparseDatesReviews,
    getPastRevisionsDates,
    getFutureRevisionsDates,
    SparseDatesReviews,
} from "@/lib/utils/statistics";

describe(toSparseDatesReviews, () => {
    describe.each([
        { entries: [], expected: {} },
        { entries: [{ date: "2020-03-04", reviews: 1 }], expected: { "2020-03-04": 1 } },
        {
            entries: [
                { date: "2020-03-04", reviews: 1 },
                { date: "2020-03-05", reviews: 3 },
                { date: "2020-03-08", reviews: 2 },
            ],
            expected: {
                "2020-03-04": 1,
                "2020-03-05": 3,
                "2020-03-08": 2,
            },
        },
    ])("given date entries $entries", ({ entries, expected }) => {
        test(`should return correct mapping`, () => {
            const output = toSparseDatesReviews(entries);

            expect(output).toEqual(expected);
        });
    });
});

describe(getPastRevisionsDates, () => {
    const timezone = "America/New_York";
    const startDate = new Date("2020-03-04T02:02:00.000Z");

    describe(`given time zone '${timezone}' and start date ${startDate.toISOString()}`, () => {
        describe.each([
            {
                inputDescription: "no date mappings",
                mapping: {} as SparseDatesReviews,
                expected: [
                    { date: new Date("2020-02-03T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-04T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-05T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-06T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-07T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-08T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-09T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-10T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-11T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-12T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-13T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-14T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-15T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-16T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-17T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-18T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-19T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-20T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-21T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-22T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-23T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-24T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-25T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-26T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-27T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-28T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-29T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-01T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-02T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 0 }, // Start of the "current" date (computed from the current moment date and the timezone). 2020-03-04T02:02:00.000Z in the America/New_York timezone falls on 2020-03-03 (the previous date), and 12 AM (start of the day) in that timezone is equivalent to 5AM in UTC
                ],
            },
            {
                inputDescription: "some date mappings",
                mapping: {
                    "2020-02-03": 1,
                    "2020-02-04": 5,
                    "2020-02-07": 15,
                },
                expected: [
                    { date: new Date("2020-02-03T05:00:00.000Z"), reviews: 1 },
                    { date: new Date("2020-02-04T05:00:00.000Z"), reviews: 5 },
                    { date: new Date("2020-02-05T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-06T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-07T05:00:00.000Z"), reviews: 15 },
                    { date: new Date("2020-02-08T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-09T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-10T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-11T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-12T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-13T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-14T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-15T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-16T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-17T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-18T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-19T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-20T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-21T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-22T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-23T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-24T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-25T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-26T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-27T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-28T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-02-29T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-01T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-02T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 0 },
                ],
            },
            {
                inputDescription: "excessive date mappings",
                mapping: {
                    "2020-01-31": 25,
                    "2020-02-01": 1,
                    "2020-02-02": 3,
                    "2020-02-03": 2, // First included date
                    "2020-02-04": 4,
                    "2020-02-05": 3,
                    "2020-02-06": 5,
                    "2020-02-07": 4,
                    "2020-02-08": 6,
                    "2020-02-09": 5,
                    "2020-02-10": 7,
                    "2020-02-11": 6,
                    "2020-02-12": 8,
                    "2020-02-13": 7,
                    "2020-02-14": 9,
                    "2020-02-15": 8,
                    "2020-02-16": 10,
                    "2020-02-17": 9,
                    "2020-02-18": 11,
                    "2020-02-19": 10,
                    "2020-02-20": 12,
                    "2020-02-21": 11,
                    "2020-02-22": 13,
                    "2020-02-23": 12,
                    "2020-02-24": 14,
                    "2020-02-25": 13,
                    "2020-02-26": 15,
                    "2020-02-27": 14,
                    "2020-02-28": 16,
                    "2020-02-29": 15,
                    "2020-03-01": 17,
                    "2020-03-02": 16,
                    "2020-03-03": 18, // Last included date
                    "2020-03-04": 17,
                    "2020-03-05": 19,
                    "2020-03-07": 30,
                },
                expected: [
                    { date: new Date("2020-02-03T05:00:00.000Z"), reviews: 2 },
                    { date: new Date("2020-02-04T05:00:00.000Z"), reviews: 4 },
                    { date: new Date("2020-02-05T05:00:00.000Z"), reviews: 3 },
                    { date: new Date("2020-02-06T05:00:00.000Z"), reviews: 5 },
                    { date: new Date("2020-02-07T05:00:00.000Z"), reviews: 4 },
                    { date: new Date("2020-02-08T05:00:00.000Z"), reviews: 6 },
                    { date: new Date("2020-02-09T05:00:00.000Z"), reviews: 5 },
                    { date: new Date("2020-02-10T05:00:00.000Z"), reviews: 7 },
                    { date: new Date("2020-02-11T05:00:00.000Z"), reviews: 6 },
                    { date: new Date("2020-02-12T05:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-02-13T05:00:00.000Z"), reviews: 7 },
                    { date: new Date("2020-02-14T05:00:00.000Z"), reviews: 9 },
                    { date: new Date("2020-02-15T05:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-02-16T05:00:00.000Z"), reviews: 10 },
                    { date: new Date("2020-02-17T05:00:00.000Z"), reviews: 9 },
                    { date: new Date("2020-02-18T05:00:00.000Z"), reviews: 11 },
                    { date: new Date("2020-02-19T05:00:00.000Z"), reviews: 10 },
                    { date: new Date("2020-02-20T05:00:00.000Z"), reviews: 12 },
                    { date: new Date("2020-02-21T05:00:00.000Z"), reviews: 11 },
                    { date: new Date("2020-02-22T05:00:00.000Z"), reviews: 13 },
                    { date: new Date("2020-02-23T05:00:00.000Z"), reviews: 12 },
                    { date: new Date("2020-02-24T05:00:00.000Z"), reviews: 14 },
                    { date: new Date("2020-02-25T05:00:00.000Z"), reviews: 13 },
                    { date: new Date("2020-02-26T05:00:00.000Z"), reviews: 15 },
                    { date: new Date("2020-02-27T05:00:00.000Z"), reviews: 14 },
                    { date: new Date("2020-02-28T05:00:00.000Z"), reviews: 16 },
                    { date: new Date("2020-02-29T05:00:00.000Z"), reviews: 15 },
                    { date: new Date("2020-03-01T05:00:00.000Z"), reviews: 17 },
                    { date: new Date("2020-03-02T05:00:00.000Z"), reviews: 16 },
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 18 },
                ],
            },
        ])("given input with $inputDescription ($mapping)", ({ mapping, expected }) => {
            test("should return correct past retrospective date list", () => {
                const output = getPastRevisionsDates(timezone, startDate, mapping);

                expect(output).toEqual(expected);
            });
        });
    });
});

describe(getFutureRevisionsDates, () => {
    const timezone = "America/New_York";
    const startDate = new Date("2020-03-04T02:02:00.000Z");

    describe(`given time zone '${timezone}' and start date ${startDate.toISOString()}`, () => {
        describe.each([
            {
                inputDescription: "no date mappings",
                mapping: {} as SparseDatesReviews, // Without any entries, the compiler cannot figure out on its own that this object is of the SparseDatesReviews type
                expected: [
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 0 }, // Start of the "current" date
                    { date: new Date("2020-03-04T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-05T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-06T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-07T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-08T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-09T04:00:00.000Z"), reviews: 0 }, // Date start timestamp shifts due to daylight saving time
                    { date: new Date("2020-03-10T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-11T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-12T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-13T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-14T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-15T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-16T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-17T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-18T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-19T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-20T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-21T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-22T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-23T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-24T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-25T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-26T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-27T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-28T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-29T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-30T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-31T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-04-01T04:00:00.000Z"), reviews: 0 },
                ],
            },
            {
                inputDescription: "some date mappings",
                mapping: {
                    "2020-03-11": 6,
                    "2020-03-12": 8,
                    "2020-03-15": 8,
                },
                expected: [
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-04T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-05T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-06T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-07T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-08T05:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-09T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-10T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-11T04:00:00.000Z"), reviews: 6 },
                    { date: new Date("2020-03-12T04:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-03-13T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-14T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-15T04:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-03-16T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-17T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-18T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-19T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-20T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-21T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-22T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-23T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-24T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-25T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-26T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-27T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-28T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-29T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-30T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-03-31T04:00:00.000Z"), reviews: 0 },
                    { date: new Date("2020-04-01T04:00:00.000Z"), reviews: 0 },
                ],
            },
            {
                inputDescription: "excessive date mappings",
                mapping: {
                    "2020-02-29": 30,
                    "2020-03-01": 1,
                    "2020-03-02": 3,
                    "2020-03-03": 2,
                    "2020-03-04": 4,
                    "2020-03-05": 3,
                    "2020-03-06": 5,
                    "2020-03-07": 4,
                    "2020-03-08": 6,
                    "2020-03-09": 5,
                    "2020-03-10": 7,
                    "2020-03-11": 6,
                    "2020-03-12": 8,
                    "2020-03-13": 7,
                    "2020-03-14": 9,
                    "2020-03-15": 8,
                    "2020-03-16": 10,
                    "2020-03-17": 9,
                    "2020-03-18": 11,
                    "2020-03-19": 10,
                    "2020-03-20": 12,
                    "2020-03-21": 11,
                    "2020-03-22": 13,
                    "2020-03-23": 12,
                    "2020-03-24": 14,
                    "2020-03-25": 13,
                    "2020-03-26": 15,
                    "2020-03-27": 14,
                    "2020-03-28": 16,
                    "2020-03-29": 15,
                    "2020-03-30": 17,
                    "2020-03-31": 16,
                    "2020-04-01": 18,
                    "2020-04-02": 17,
                    "2020-04-03": 19,
                    "2020-04-07": 25,
                },
                expected: [
                    { date: new Date("2020-03-03T05:00:00.000Z"), reviews: 36 }, // Review prediction adds overdue cards (due on earlier dates) to the cards due on the first prediction interval date, urging the user to review as soon as possible
                    { date: new Date("2020-03-04T05:00:00.000Z"), reviews: 4 },
                    { date: new Date("2020-03-05T05:00:00.000Z"), reviews: 3 },
                    { date: new Date("2020-03-06T05:00:00.000Z"), reviews: 5 },
                    { date: new Date("2020-03-07T05:00:00.000Z"), reviews: 4 },
                    { date: new Date("2020-03-08T05:00:00.000Z"), reviews: 6 },
                    { date: new Date("2020-03-09T04:00:00.000Z"), reviews: 5 },
                    { date: new Date("2020-03-10T04:00:00.000Z"), reviews: 7 },
                    { date: new Date("2020-03-11T04:00:00.000Z"), reviews: 6 },
                    { date: new Date("2020-03-12T04:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-03-13T04:00:00.000Z"), reviews: 7 },
                    { date: new Date("2020-03-14T04:00:00.000Z"), reviews: 9 },
                    { date: new Date("2020-03-15T04:00:00.000Z"), reviews: 8 },
                    { date: new Date("2020-03-16T04:00:00.000Z"), reviews: 10 },
                    { date: new Date("2020-03-17T04:00:00.000Z"), reviews: 9 },
                    { date: new Date("2020-03-18T04:00:00.000Z"), reviews: 11 },
                    { date: new Date("2020-03-19T04:00:00.000Z"), reviews: 10 },
                    { date: new Date("2020-03-20T04:00:00.000Z"), reviews: 12 },
                    { date: new Date("2020-03-21T04:00:00.000Z"), reviews: 11 },
                    { date: new Date("2020-03-22T04:00:00.000Z"), reviews: 13 },
                    { date: new Date("2020-03-23T04:00:00.000Z"), reviews: 12 },
                    { date: new Date("2020-03-24T04:00:00.000Z"), reviews: 14 },
                    { date: new Date("2020-03-25T04:00:00.000Z"), reviews: 13 },
                    { date: new Date("2020-03-26T04:00:00.000Z"), reviews: 15 },
                    { date: new Date("2020-03-27T04:00:00.000Z"), reviews: 14 },
                    { date: new Date("2020-03-28T04:00:00.000Z"), reviews: 16 },
                    { date: new Date("2020-03-29T04:00:00.000Z"), reviews: 15 },
                    { date: new Date("2020-03-30T04:00:00.000Z"), reviews: 17 },
                    { date: new Date("2020-03-31T04:00:00.000Z"), reviews: 16 },
                    { date: new Date("2020-04-01T04:00:00.000Z"), reviews: 18 },
                ],
            },
        ])("given input with $inputDescription ($mapping)", ({ mapping, expected }) => {
            test("should return correct past predictive date list", () => {
                const output = getFutureRevisionsDates(timezone, startDate, mapping);

                expect(output).toEqual(expected);
            });
        });
    });
});
