import { CardHealthBarWithLabel } from "@/components/resource/bars/card-health-bar-with-label";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { getLocaleDateString } from "@/lib/ui/generic";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/resource/bars/health-bar");

const mockedHealthBar = vi.mocked(HealthBar);

describe(CardHealthBarWithLabel, () => {
    test.each([
        { dueDate: new Date("2020-02-03T13:59:04.000Z"), timezone: "America/New_York" },
        { dueDate: new Date("2020-02-04T07:35:43.000Z"), timezone: "UTC" },
        { dueDate: new Date("2020-17-03T20:43:07.000Z"), timezone: "Europe/Berlin" },
    ])(
        "should pass correct label to 'HealthBar' when card due date is $dueDate and timezone is $timezone",
        ({ dueDate, timezone }) => {
            const retrievability = 0;
            const expectedLabel = `Due: ${getLocaleDateString(dueDate, timezone)}`; // This function is tested elsewhere, so assumed to be correct here

            render(
                <CardHealthBarWithLabel
                    retrievability={retrievability}
                    due={dueDate}
                    timezone={timezone}
                />,
            );

            expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    label: expectedLabel,
                }),
                {},
            );
        },
    );

    test.each([
        { retrievability: 0 },
        { retrievability: 0.1 },
        { retrievability: 0.5 },
        { retrievability: 0.999 },
        { retrievability: 1 },
    ])(
        "should correctly forward retrievability to 'HealthBar' for retrievability $retrievability",
        ({ retrievability }) => {
            const dueDate = new Date("2020-02-03T13:59:04.000Z");
            const timezone = "America/New_York";

            render(
                <CardHealthBarWithLabel
                    retrievability={retrievability}
                    due={dueDate}
                    timezone={timezone}
                />,
            );

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
        const dueDate = new Date("2020-02-03T13:59:04.000Z");
        const timezone = "America/New_York";

        render(
            <CardHealthBarWithLabel
                retrievability={retrievability}
                due={dueDate}
                timezone={timezone}
                withBarText
            />,
        );

        expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                withText: true,
            }),
            {},
        );
    });
});
