import { DEFAULT_LABEL, HealthBar } from "@/components/resource/bars/health-bar";
import {
    bgFineForegroundClass,
    bgProblemForegroundClass,
    bgUnimportantForegroundClass,
    bgWarningForegroundClass,
} from "@/lib/ui/tailwind";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe.each([
    {
        retrievability: null,
        label: "Average",
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
        label: "Deck average:",
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
        label: "Account average:",
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
        label: "Deck average",
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
    HealthBar,
    ({ retrievability, label, expectedProgressPercent, expectedText, expectedForegroundClass }) => {
        test(`should correctly render bar at ${expectedProgressPercent}% fullness for retrievability input ${retrievability}`, () => {
            render(<HealthBar retrievability={retrievability} />);
            const bar = screen.queryByRole("progressbar");
            const indicator = bar?.firstChild;

            expect(bar).toBeInTheDocument();
            expect(indicator).toBeInTheDocument();
            expect(indicator).toHaveStyle({
                transform: `translateX(-${100 - expectedProgressPercent}%)`,
            });
        });

        test(`should correctly assign bar color class as ${expectedForegroundClass} for retrievability input ${retrievability}`, () => {
            render(<HealthBar retrievability={retrievability} />);
            const bar = screen.queryByRole("progressbar");

            expect(bar).toBeInTheDocument();
            expect(bar).toHaveClass(`[&>div]:${expectedForegroundClass}`);
        });

        test(`should render text representation of the bar when explicitly specified for retrievability input ${retrievability}`, () => {
            render(<HealthBar retrievability={retrievability} withText />);
            const text = screen.queryByText(expectedText);

            expect(text).toBeInTheDocument();
        });

        test(`should not render text representation of the bar when not explicitly specified for retrievability input ${retrievability}`, () => {
            render(<HealthBar retrievability={retrievability} />);
            const text = screen.queryByText(expectedText);

            expect(text).not.toBeInTheDocument();
        });

        if (label) {
            test(`should render and assign custom label for the healthbar when provided label ${label} and retrievability input ${retrievability}`, () => {
                render(<HealthBar retrievability={retrievability} label={label} />);

                const labelElement = screen.queryByText(label);
                const barByName = screen.queryByRole("progressbar", { name: label });

                expect(labelElement).toBeInTheDocument();
                expect(barByName).toBeInTheDocument();
            });
        } else {
            test(`should assign default aria label and not render any label for the healthbar when provided no custom label and retrievability input is ${retrievability}`, () => {
                render(<HealthBar retrievability={retrievability} label={label} />);

                const labelElement = screen.queryByText(DEFAULT_LABEL);
                const barByName = screen.queryByRole("progressbar", { name: DEFAULT_LABEL });

                expect(labelElement).not.toBeInTheDocument();
                expect(barByName).toBeInTheDocument();
            });
        }
    },
);
