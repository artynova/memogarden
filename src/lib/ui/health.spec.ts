import { HealthState } from "@/lib/enums";
import { toHealthState } from "@/lib/ui/health";
import { describe, expect, test } from "vitest";

describe(toHealthState, () => {
    describe.each([
        { retrievability: null, expected: HealthState.Unknown },
        { retrievability: 0, expected: HealthState.Withering },
        { retrievability: 20, expected: HealthState.Withering },
        { retrievability: 39, expected: HealthState.Withering },
        { retrievability: 40, expected: HealthState.Neglected },
        { retrievability: 64, expected: HealthState.Neglected },
        { retrievability: 89, expected: HealthState.Neglected },
        { retrievability: 90, expected: HealthState.Lush },
        { retrievability: 95, expected: HealthState.Lush },
        { retrievability: 99, expected: HealthState.Lush },
        {
            retrievability: 100,
            expected: HealthState.FreshlyWatered,
            expectedLabel: "Freshly watered",
        },
    ])("given retrievability $retrievability", ({ retrievability, expected }) => {
        test(`should return health state '${HealthState[expected]}'`, () => {
            const output = toHealthState(retrievability);

            expect(output).toEqual(expected);
        });
    });
});
