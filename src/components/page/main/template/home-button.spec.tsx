import { HomeButton } from "@/components/page/main/template/home-button";
import { HOME } from "@/lib/routes";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(HomeButton, () => {
    test("should contain a link to the app home page", () => {
        render(<HomeButton />);
        const link = screen.queryByRole("link");

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", HOME);
    });
});
