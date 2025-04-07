import { DEFAULT_LABEL, HealthBar } from "@/components/resource/bars/health-bar";
import {
    bgFineForegroundClass,
    bgProblemForegroundClass,
    bgUnimportantForegroundClass,
    bgWarningForegroundClass,
} from "@/lib/ui/tailwind";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(HealthBar, () => {
    describe.each([
        {
            retrievability: null,
            expectedProgressPercent: 0,
            expectedText: "Not yet planted",
            expectedForegroundClass: bgUnimportantForegroundClass,
        },
        {
            retrievability: 0,
            expectedProgressPercent: 0,
            expectedText: "Withering, 0%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.01,
            expectedProgressPercent: 1,
            expectedText: "Withering, 1%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.013,
            expectedProgressPercent: 1,
            expectedText: "Withering, 1%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.015,
            label: "Test 1",
            expectedProgressPercent: 2,
            expectedText: "Withering, 2%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.017,
            expectedProgressPercent: 2,
            expectedText: "Withering, 2%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.02,
            expectedProgressPercent: 2,
            expectedText: "Withering, 2%",
            expectedForegroundClass: bgProblemForegroundClass,
        },
        {
            retrievability: 0.5,
            expectedProgressPercent: 50,
            expectedText: "Neglected, 50%",
            expectedForegroundClass: bgWarningForegroundClass,
        },
        {
            retrievability: 0.55,
            expectedProgressPercent: 55,
            expectedText: "Neglected, 55%",
            expectedForegroundClass: bgWarningForegroundClass,
        },
        {
            retrievability: 0.99,
            expectedProgressPercent: 99,
            expectedText: "Lush, 99%",
            expectedForegroundClass: bgFineForegroundClass,
        },
        {
            retrievability: 0.999,
            expectedProgressPercent: 100,
            expectedText: "Freshly watered, 100%",
            expectedForegroundClass: bgFineForegroundClass,
        },
        {
            retrievability: 1,
            expectedProgressPercent: 100,
            expectedText: "Freshly watered, 100%",
            expectedForegroundClass: bgFineForegroundClass,
        },
    ])(
        "given retrievability $retrievability",
        ({ retrievability, expectedProgressPercent, expectedText, expectedForegroundClass }) => {
            test(`should render bar with ${expectedProgressPercent}% fullness`, () => {
                render(<HealthBar retrievability={retrievability} />);
                const bar = screen.queryByRole("progressbar");
                const indicator = bar?.firstChild;

                expect(bar).toBeInTheDocument();
                expect(bar).toHaveAttribute("aria-valuenow", expectedProgressPercent.toString());
                expect(indicator).toBeInTheDocument();
            });

            test(`should use indicator color class ${expectedForegroundClass}`, () => {
                render(<HealthBar retrievability={retrievability} />);
                const bar = screen.queryByRole("progressbar");

                expect(bar).toBeInTheDocument();
                expect(bar).toHaveClass(`[&>div]:${expectedForegroundClass}`);
            });

            describe("given no value for prop 'withText'", () => {
                test("should not render bar text representation", () => {
                    render(<HealthBar retrievability={retrievability} />);
                    const text = screen.queryByText(expectedText);

                    expect(text).not.toBeInTheDocument();
                });
            });

            describe("given value 'true' for prop 'withText'", () => {
                test("should render bar text representation", () => {
                    render(<HealthBar retrievability={retrievability} withText />);
                    const text = screen.queryByText(expectedText);

                    expect(text).toBeInTheDocument();
                });
            });

            describe("given no label", () => {
                test("should assign default ARIA label to bar element", () => {
                    render(<HealthBar retrievability={retrievability} />);

                    const barByName = screen.queryByRole("progressbar", { name: DEFAULT_LABEL });

                    expect(barByName).toBeInTheDocument();
                });

                test("should not render label element", () => {
                    render(<HealthBar retrievability={retrievability} />);

                    const labelElement = screen.queryByText(DEFAULT_LABEL);

                    expect(labelElement).not.toBeInTheDocument();
                });
            });

            describe.each([
                { label: "Average" },
                { label: "Deck average:" },
                { label: "Account average:" },
                { label: "Deck average" },
            ])("given label $label", ({ label }) => {
                test(`should assign label text ARIA label to bar element`, () => {
                    render(<HealthBar retrievability={retrievability} label={label} />);

                    const barByName = screen.queryByRole("progressbar", { name: label });

                    expect(barByName).toBeInTheDocument();
                });
                test("should render label element", () => {
                    render(<HealthBar retrievability={retrievability} label={label} />);

                    const labelElement = screen.queryByText(label);

                    expect(labelElement).toBeInTheDocument();
                });
            });
        },
    );
});
