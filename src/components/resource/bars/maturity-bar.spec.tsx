import { MaturityBar } from "@/components/resource/bars/maturity-bar";
import { cardMaturities } from "@/lib/ui/maturity";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe.each([
    { maturity: 0 },
    { maturity: 1 },
    { maturity: 2 },
    { maturity: 3 },
    { maturity: 4 },
    { maturity: 5 },
])(MaturityBar, ({ maturity }) => {
    const currentMaturityName = cardMaturities[maturity].name;

    test(`should render the current maturity point as highlighted when current maturity is '${currentMaturityName}'`, () => {
        render(<MaturityBar currentMaturity={maturity} />);
        const label = screen.queryByText(currentMaturityName);
        const icon = label?.parentElement?.getElementsByTagName("svg")[0];

        expect(label).toBeInTheDocument();
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass("text-accent");
        expect(icon).toHaveAttribute("aria-label", `${currentMaturityName} icon`);
    });

    test(`should render all maturity points besides the current one as non-highlighted when current maturity is '${currentMaturityName}'`, () => {
        render(<MaturityBar currentMaturity={maturity} />);

        cardMaturities.forEach(({ name }, index) => {
            if (index === maturity) return; // No need to check the current point in this test as it is checked separately
            const label = screen.queryByText(name);
            const icon = label?.parentElement?.getElementsByTagName("svg")[0];

            expect(label).toBeInTheDocument();
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("text-muted");
            expect(icon).toHaveAttribute("aria-label", `${name} icon`);
        });
    });
});
