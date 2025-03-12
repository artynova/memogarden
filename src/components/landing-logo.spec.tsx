import { LandingLogo } from "@/components/landing-logo";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(LandingLogo, () => {
    test("should render link with href '/'", () => {
        render(<LandingLogo />);
        const link = screen.queryByRole("link");

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/");
    });

    test("should render logo icon with accessible label", () => {
        const { container } = render(<LandingLogo />);
        const link = container.getElementsByTagName("svg")[0];

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("aria-label");
    });
});
