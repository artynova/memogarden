import AnimatedLoadingText from "@/components/page/main/skeleton/animated-loading-text";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(AnimatedLoadingText, () => {
    test("should contain text 'Loading'", () => {
        render(<AnimatedLoadingText />);
        const textContainer = screen.queryByText(/loading/i);

        expect(textContainer).toBeInTheDocument();
    });
});
