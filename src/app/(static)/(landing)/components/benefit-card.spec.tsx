import { BenefitCard } from "@/app/(static)/(landing)/components/benefit-card";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

describe(BenefitCard, () => {
    describe.each([
        { title: "Ease of use" },
        { title: "Reliable scheduling" },
        { title: "Lorem ipsum" },
    ])("given title $title", ({ title }) => {
        test(`should render title`, () => {
            render(<BenefitCard title={title} Icon={() => null} />);
            const titleContainer = screen.queryByText(title);

            expect(titleContainer).toBeInTheDocument();
        });

        test(`should render passed icon with accessible label '${title} icon'`, () => {
            const mockIcon = vi.fn();
            render(<BenefitCard title={title} Icon={mockIcon} />);

            expect(mockIcon).toHaveBeenCalledOnceWithProps({ "aria-label": `${title} icon` });
        });
    });
});
