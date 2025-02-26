import { HeaderSkeleton } from "@/components/page/main/skeleton/header-skeleton";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(HeaderSkeleton, () => {
    test("should render 'Home' button by default", () => {
        render(<HeaderSkeleton />);
        const link = screen.queryByText(/home/i);

        expect(link).toBeInTheDocument();
    });

    test("should not render 'Home' button when directed to avoid it", () => {
        render(<HeaderSkeleton hideHomeButton />);
        const link = screen.queryByText(/home/i);

        expect(link).not.toBeInTheDocument();
    });
});
