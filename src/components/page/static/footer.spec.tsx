import { Footer } from "@/components/page/static/footer";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(Footer, () => {
    test.each([
        { href: "/" },
        { href: "/signin" },
        { href: "/signup" },
        { href: "https://github.com/artynova/memogarden" },
    ])("should have a link with href $href", ({ href }) => {
        render(<Footer />);
        const link = screen
            .getAllByRole("link")
            .find((element) => element.getAttribute("href") === href);

        expect(link).toBeInTheDocument();
    });

    test("should use semantic footer tag", () => {
        const { container } = render(<Footer />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(1);
    });
});
