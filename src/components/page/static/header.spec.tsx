import { Header } from "@/components/page/static/header";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(Header, () => {
    test.each([{ href: "/" }, { href: "/signin" }, { href: "/signup" }])(
        "should have a link with href $href",
        ({ href }) => {
            render(<Header />);
            const link = screen
                .getAllByRole("link")
                .find((element) => element.getAttribute("href") === href);

            expect(link).toBeInTheDocument();
        },
    );

    test("should use semantic footer tag", () => {
        const { container } = render(<Header />);
        const headers = container.getElementsByTagName("header");

        expect(headers.length).toEqual(1);
    });
});
