import { Footer } from "@/components/page/static/footer";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(Footer, () => {
    describe.each([
        { href: "/" },
        { href: "/signin" },
        { href: "/signup" },
        { href: "https://github.com/artynova/memogarden" },
    ])("", ({ href }) => {
        test(`should render link with href ${href}`, () => {
            render(<Footer />);
            const link = screen
                .getAllByRole("link")
                .find((element) => element.getAttribute("href") === href);

            expect(link).toBeInTheDocument();
        });
    });

    test("should use semantic footer tag", () => {
        const { container } = render(<Footer />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(1);
    });
});
