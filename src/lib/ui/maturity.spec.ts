import { CardMaturity, CardState } from "@/lib/enums";
import { getCardMaturity } from "@/lib/ui/maturity";
import { describe, expect, test } from "vitest";

describe(getCardMaturity, () => {
    test("should return maturity 'Seed' for cards with SRS state 'New'", () => {
        const state = CardState.New;
        const interval = 0;

        const output = getCardMaturity(state, interval);

        expect(output).toEqual(CardMaturity.Seed);
    });

    test.each([
        { state: CardState.Learning, stateLabel: "Learning" },
        { state: CardState.Relearning, stateLabel: "Relearning" },
    ])("should return maturity 'Sapling' for cards with SRS state $stateLabel", ({ state }) => {
        const interval = 0;

        const output = getCardMaturity(state, interval);

        expect(output).toEqual(CardMaturity.Sprout);
    });

    test.each([
        {
            interval: 1,
            expected: CardMaturity.Sapling,
            expectedLabel: "Sapling",
        },
        {
            interval: 7,
            expected: CardMaturity.Sapling,
            expectedLabel: "Sapling",
        },
        {
            interval: 15,
            expected: CardMaturity.Sapling,
            expectedLabel: "Sapling",
        },
        {
            interval: 16,
            expected: CardMaturity.Budding,
            expectedLabel: "Budding",
        },
        {
            interval: 24,
            expected: CardMaturity.Budding,
            expectedLabel: "Budding",
        },
        {
            interval: 30,
            expected: CardMaturity.Budding,
            expectedLabel: "Budding",
        },
        {
            interval: 31,
            expected: CardMaturity.Mature,
            expectedLabel: "Mature",
        },
        {
            interval: 47,
            expected: CardMaturity.Mature,
            expectedLabel: "Mature",
        },
        {
            interval: 61,
            expected: CardMaturity.Mature,
            expectedLabel: "Mature",
        },
        {
            interval: 62,
            expected: CardMaturity.Mighty,
            expectedLabel: "Mighty",
        },
        {
            interval: 72,
            expected: CardMaturity.Mighty,
            expectedLabel: "Mighty",
        },
    ])(
        "should return maturity $expectedLabel for cards with SRS state 'Review' and review interval of $interval days",
        ({ interval, expected }) => {
            const state = CardState.Review;

            const output = getCardMaturity(state, interval);

            expect(output).toEqual(expected);
        },
    );
});
