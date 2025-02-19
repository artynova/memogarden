import { HealthState } from "@/lib/enums";
import { toHealthState } from "@/lib/ui/health";
import { describe, expect, test } from "vitest";

describe(toHealthState, () => {
    test.each([
        { retrievability: null, expected: HealthState.Unknown, expectedLabel: "Unknown" },
        { retrievability: 0, expected: HealthState.Withering, expectedLabel: "Withering" },
        { retrievability: 20, expected: HealthState.Withering, expectedLabel: "Withering" },
        { retrievability: 39, expected: HealthState.Withering, expectedLabel: "Withering" },
        { retrievability: 40, expected: HealthState.Neglected, expectedLabel: "Neglected" },
        { retrievability: 64, expected: HealthState.Neglected, expectedLabel: "Neglected" },
        { retrievability: 89, expected: HealthState.Neglected, expectedLabel: "Neglected" },
        { retrievability: 90, expected: HealthState.Lush, expectedLabel: "Lush" },
        { retrievability: 95, expected: HealthState.Lush, expectedLabel: "Lush" },
        { retrievability: 99, expected: HealthState.Lush, expectedLabel: "Lush" },
        {
            retrievability: 100,
            expected: HealthState.FreshlyWatered,
            expectedLabel: "Freshly watered",
        },
    ])(
        "should convert retrievability $retrievability to health state $expectedLabel",
        ({ retrievability, expected }) => {
            const output = toHealthState(retrievability);

            expect(output).toEqual(expected);
        },
    );
});
