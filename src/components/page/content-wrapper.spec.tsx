import { ContentWrapper } from "@/components/page/content-wrapper";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(ContentWrapper, () => {
    describe("given no value for 'variant' prop", () => {
        test("should use 'default' variant", () => {
            render(<ContentWrapper>Content</ContentWrapper>);
            const wrapper = screen.getByText("Content");

            expect(wrapper).toHaveClass("max-w-screen-lg");
        });
    });

    describe.each([
        { variant: "default" as const, checkClass: "max-w-screen-lg" },
        { variant: "compact" as const, checkClass: "items-stretch justify-center" },
    ])("given $variant value for 'variant' prop", ({ variant, checkClass }) => {
        test("should use 'default' variant styling when specified", () => {
            const { container } = render(
                <ContentWrapper variant={variant}>Content</ContentWrapper>,
            );
            const wrapper = container.firstChild;

            expect(wrapper).toHaveClass(checkClass);
        });
    });
});
