import { BenefitCard } from "@/app/(static)/(landing)/components/benefit-card";
import { BenefitsSection } from "@/app/(static)/(landing)/components/benefits-section";
import { Section } from "@/app/(static)/(landing)/components/section";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/(static)/(landing)/components/section");
vi.mock("@/app/(static)/(landing)/components/benefit-card");

const mockedSection = vi.mocked(Section);
const mockedBenefitCard = vi.mocked(BenefitCard);

describe(BenefitsSection, () => {
    beforeEach(() => {
        replaceWithChildren(mockedSection);
    });

    test("should wrap content in a 'Section' component", () => {
        render(<BenefitsSection />);

        expect(mockedSection).toHaveBeenCalledOnce();
    });

    test("should render 6 benefit cards", () => {
        render(<BenefitsSection />);

        expect(mockedBenefitCard).toHaveBeenCalledTimes(6);
    });

    test("should contain sign-up call to action", () => {
        render(<BenefitsSection />);
        const signupButton = screen.queryByRole("link", { name: /sign up/i });

        expect(signupButton).toBeInTheDocument();
        expect(signupButton).toHaveAttribute("href", "/signup");
    });
});
