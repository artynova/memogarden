import { HeaderSkeleton } from "@/components/page/main/skeleton/header-skeleton";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(HeaderSkeleton, () => {
    describe("given no value for 'hideHomeButton' prop", () => {
        test("should render 'Home' button", () => {
            render(<HeaderSkeleton />);
            const link = screen.queryByText(/home/i);

            expect(link).toBeInTheDocument();
        });
    });

    describe("given true value for 'hideHomeButton' prop", () => {
        test("should not render 'Home' button", () => {
            render(<HeaderSkeleton hideHomeButton />);
            const link = screen.queryByText(/home/i);

            expect(link).not.toBeInTheDocument();
        });
    });
});
