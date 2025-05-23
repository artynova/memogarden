import { LoadingSpinner } from "@/components/page/main/skeleton/loading-spinner";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(LoadingSpinner, () => {
    test("should have ARIA status role", () => {
        render(<LoadingSpinner />);
        const spinner = screen.queryByRole("status", { name: /loading/i });

        expect(spinner).toBeInTheDocument();
    });
});
