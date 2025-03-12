import { MaturityBar } from "@/components/resource/bars/maturity-bar";
import { CardMaturity } from "@/lib/enums";
import { cardMaturities } from "@/lib/ui/maturity";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(MaturityBar, () => {
    describe.each(
        cardMaturities.map(({ name }, index) => ({
            currentMaturity: index as CardMaturity,
            currentMaturityName: name,
        })),
    )("given current maturity $currentMaturityName", ({ currentMaturity, currentMaturityName }) => {
        describe.each(
            cardMaturities.map(({ name }, index) => ({
                maturity: index as CardMaturity,
                maturityName: name,
            })),
        )("for maturity $maturityName", ({ maturity, maturityName }) => {
            test(`should render maturity point with label '${maturityName} icon'`, () => {
                render(<MaturityBar currentMaturity={currentMaturity} />);

                const label = screen.queryByText(currentMaturityName);
                const icon = label?.parentElement?.getElementsByTagName("svg")[0];

                expect(label).toBeInTheDocument();
                expect(icon).toBeInTheDocument();
                expect(icon).toHaveAttribute("aria-label", `${currentMaturityName} icon`);
            });

            if (maturity === currentMaturity) {
                test(`should render maturity point as highlighted`, () => {
                    render(<MaturityBar currentMaturity={currentMaturity} />);
                    const icon = screen
                        .getByText(maturityName)
                        .parentElement?.getElementsByTagName("svg")[0];

                    expect(icon).toHaveClass("text-accent");
                });
            } else {
                test(`should render maturity point as muted`, () => {
                    render(<MaturityBar currentMaturity={currentMaturity} />);
                    const icon = screen
                        .getByText(maturityName)
                        .parentElement?.getElementsByTagName("svg")[0];

                    expect(icon).toHaveClass("text-muted");
                });
            }
        });
    });
});
