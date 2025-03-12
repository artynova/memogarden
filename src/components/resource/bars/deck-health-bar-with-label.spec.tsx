import {
    DeckHealthBarWithLabel,
    LABEL,
} from "@/components/resource/bars/deck-health-bar-with-label";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/resource/bars/health-bar");
const mockedHealthBar = vi.mocked(HealthBar);

describe(DeckHealthBarWithLabel, () => {
    test("should pass correct label to 'HealthBar'", () => {
        render(<DeckHealthBarWithLabel retrievability={fakeCompliantValue()} />);

        expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ label: LABEL });
    });

    describe.each([
        { retrievability: null },
        { retrievability: 0 },
        { retrievability: 0.1 },
        { retrievability: 0.5 },
        { retrievability: 0.999 },
        { retrievability: 1 },
    ])("given retrievability $retrievability", ({ retrievability }) => {
        test("should forward retrievability to 'HealthBar'", () => {
            render(<DeckHealthBarWithLabel retrievability={retrievability} />);

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ retrievability });
        });
    });

    describe("given no value for 'withBarText' flag", () => {
        test("should render 'HealthBar' without text representation", () => {
            render(<DeckHealthBarWithLabel retrievability={fakeCompliantValue()} withBarText />);

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ withText: true });
        });
    });

    describe("given true value for 'withBarText' flag", () => {
        test("should render 'HealthBar' with text representation", () => {
            render(<DeckHealthBarWithLabel retrievability={fakeCompliantValue()} withBarText />);

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ withText: true });
        });
    });
});
