import { HeroSection } from "@/app/(static)/(landing)/components/hero-section";
import { Section } from "@/app/(static)/(landing)/components/section";
import { AdaptiveMockup } from "@/components/mockup/adaptive-mockup";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/app/(static)/(landing)/components/section");
vi.mock("@/components/mockup/adaptive-mockup");

const mockedSection = vi.mocked(Section);
const mockedAdaptiveMockup = vi.mocked(AdaptiveMockup);
describe(HeroSection, () => {
    beforeEach(() => {
        replaceWithChildren(mockedSection);
    });

    test("should wrap content in 'Section'", () => {
        render(<HeroSection />);

        expect(mockedSection).toHaveBeenCalledOnce();
    });

    test("should contain 2 sign-up calls to action", () => {
        render(<HeroSection />);
        const signupButtons = screen.getAllByRole("link", { name: /sign up/i });

        expect(signupButtons.length).toEqual(2);
        signupButtons.forEach((button) => {
            expect(button).toHaveAttribute("href", "/signup");
        });
    });

    test("should contain adaptive screen mockup with main app screenshot", () => {
        render(<HeroSection />);

        expect(mockedAdaptiveMockup).toHaveBeenCalledOnce();
    });
});
