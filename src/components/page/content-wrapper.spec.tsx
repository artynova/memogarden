import { ContentWrapper } from "@/components/page/content-wrapper";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(ContentWrapper, () => {
    test("should use 'default' variant styling when variant is not specified", () => {
        render(<ContentWrapper>Content</ContentWrapper>);
        const wrapper = screen.getByText("Content");

        expect(wrapper).toHaveClass("max-w-screen-lg");
    });

    test("should use 'default' variant styling when specified", () => {
        render(<ContentWrapper variant="default">Content</ContentWrapper>);
        const wrapper = screen.getByText("Content");

        expect(wrapper).toHaveClass("max-w-screen-lg");
    });

    test("should use 'compact' variant styling when specified", () => {
        render(<ContentWrapper variant="compact">Content</ContentWrapper>);
        const wrapper = screen.getByText("Content");

        expect(wrapper).toHaveClass("items-stretch justify-center");
    });
});
