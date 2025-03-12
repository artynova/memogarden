import { CardHealthBarWithLabel } from "@/components/resource/bars/card-health-bar-with-label";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { getLocaleDateString } from "@/lib/ui/generic";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/resource/bars/health-bar");

const mockedHealthBar = vi.mocked(HealthBar);

describe(CardHealthBarWithLabel, () => {
    describe.each([
        { dueDate: new Date("2020-02-03T13:59:04.000Z"), timezone: "America/New_York" },
        { dueDate: new Date("2020-02-04T07:35:43.000Z"), timezone: "UTC" },
        { dueDate: new Date("2020-17-03T20:43:07.000Z"), timezone: "Europe/Berlin" },
    ])("given due date $dueDate and time zone $timezone", ({ dueDate, timezone }) => {
        test(`should pass label 'Due: ${getLocaleDateString(dueDate, timezone)}' to 'HealthBar'`, () => {
            const retrievability = 0;
            const expectedLabel = `Due: ${getLocaleDateString(dueDate, timezone)}`; // This function is tested elsewhere, so assumed to be correct here

            render(
                <CardHealthBarWithLabel
                    retrievability={retrievability}
                    due={dueDate}
                    timezone={timezone}
                />,
            );

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ label: expectedLabel });
        });
    });

    describe.each([
        { retrievability: 0 },
        { retrievability: 0.1 },
        { retrievability: 0.5 },
        { retrievability: 0.999 },
        { retrievability: 1 },
    ])("given retrievability $retrievability", ({ retrievability }) => {
        test("should forward retrievability to 'HealthBar'", () => {
            render(
                <CardHealthBarWithLabel
                    retrievability={retrievability}
                    due={fakeCompliantValue()}
                    timezone={fakeCompliantValue()}
                />,
            );

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ retrievability });
        });
    });

    describe("given no value for 'withBarText' flag", () => {
        test("should render 'HealthBar' without text representation", () => {
            render(
                <CardHealthBarWithLabel
                    retrievability={fakeCompliantValue()}
                    due={fakeCompliantValue()}
                    timezone={fakeCompliantValue()}
                    withBarText
                />,
            );

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ withText: true });
        });
    });

    describe("given true value for 'withBarText' flag", () => {
        test("should render 'HealthBar' with text representation", () => {
            render(
                <CardHealthBarWithLabel
                    retrievability={fakeCompliantValue()}
                    due={fakeCompliantValue()}
                    timezone={fakeCompliantValue()}
                    withBarText
                />,
            );

            expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({ withText: true });
        });
    });
});
