import { CardMaturity, CardState } from "@/lib/enums";
import { getCardMaturity } from "@/lib/ui/maturity";
import { fakeCompliantValue } from "@/test/mock/generic";
import { describe, expect, test } from "vitest";

describe(getCardMaturity, () => {
    describe("given SRS state 'New'", () => {
        test("should return maturity 'Seed'", () => {
            const state = CardState.New;

            const output = getCardMaturity(state, fakeCompliantValue());

            expect(output).toEqual(CardMaturity.Seed);
        });
    });

    describe.each([
        { state: CardState.Learning, stateLabel: "Learning" },
        { state: CardState.Relearning, stateLabel: "Relearning" },
    ])("given SRS state $stateLabel", ({ state }) => {
        test("should return maturity 'Sprout'", () => {
            const output = getCardMaturity(state, fakeCompliantValue());

            expect(output).toEqual(CardMaturity.Sprout);
        });
    });

    describe.each([
        {
            interval: 1,
            expected: CardMaturity.Sapling,
        },
        {
            interval: 7,
            expected: CardMaturity.Sapling,
        },
        {
            interval: 15,
            expected: CardMaturity.Sapling,
        },
        {
            interval: 16,
            expected: CardMaturity.Budding,
        },
        {
            interval: 24,
            expected: CardMaturity.Budding,
        },
        {
            interval: 30,
            expected: CardMaturity.Budding,
        },
        {
            interval: 31,
            expected: CardMaturity.Mature,
        },
        {
            interval: 47,
            expected: CardMaturity.Mature,
        },
        {
            interval: 61,
            expected: CardMaturity.Mature,
        },
        {
            interval: 62,
            expected: CardMaturity.Mighty,
        },
        {
            interval: 72,
            expected: CardMaturity.Mighty,
        },
    ])("given SRS state 'Review' and review interval $interval", ({ interval, expected }) => {
        test(`should return maturity '${CardMaturity[expected]}'`, () => {
            const state = CardState.Review;

            const output = getCardMaturity(state, interval);

            expect(output).toEqual(expected);
        });
    });
});
