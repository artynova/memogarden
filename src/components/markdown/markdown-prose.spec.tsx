import { describe, expect, test } from "vitest";
import { MarkdownProse } from "@/components/markdown/markdown-prose";
import { render, screen } from "@testing-library/react";

describe(MarkdownProse, () => {
    // This is mainly to ensure that the component passes the markdown to the rendering library properly. Testing the library itself is out of scope
    describe.each([
        { children: "**bolded**", text: "bolded", role: "strong" },
        { children: "_italicized_", text: "italicized", role: "emphasis" },
    ])("given children $children", ({ children, text, role }) => {
        test("should render markdown code that is passed to it as children", () => {
            render(<MarkdownProse>{children}</MarkdownProse>);
            const strong = screen.queryByRole(role);

            expect(strong).toBeInTheDocument();
            expect(strong).toHaveTextContent(text);
        });
    });
});
