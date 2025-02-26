import {
    DeckHealthBarWithLabel,
    LABEL,
} from "@/components/resource/bars/deck-health-bar-with-label";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/resource/bars/health-bar");
const mockedHealthBar = vi.mocked(HealthBar);

describe(DeckHealthBarWithLabel, () => {
    test("should pass correct label to 'HealthBar'", () => {
        const retrievability = 0;

        render(<DeckHealthBarWithLabel retrievability={retrievability} />);

        expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                label: LABEL,
            }),
            {},
        );
    });

    test.each([
        { retrievability: null },
        { retrievability: 0 },
        { retrievability: 0.1 },
        { retrievability: 0.5 },
        { retrievability: 0.999 },
        { retrievability: 1 },
    ])(
        "should correctly forward retrievability to 'HealthBar' for retrievability $retrievability",
        ({ retrievability }) => {
            render(<DeckHealthBarWithLabel retrievability={retrievability} />);

            expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    retrievability: retrievability,
                }),
                {},
            );
        },
    );

    test("should correctly forward text usage flag when the flag is specified", () => {
        const retrievability = 0;

        render(<DeckHealthBarWithLabel retrievability={retrievability} withBarText />);

        expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                withText: true,
            }),
            {},
        );
    });
});
