import { FooterSkeleton } from "@/components/page/main/skeleton/footer-skeleton";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(FooterSkeleton, () => {
    test("should use semantic footer tag", () => {
        const { container } = render(<FooterSkeleton />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(1);
    });
});
