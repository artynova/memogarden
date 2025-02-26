import { describe, expect, test } from "vitest";
import { MarkdownProse } from "@/components/markdown/markdown-prose";
import { render, screen } from "@testing-library/react";

describe(MarkdownProse, () => {
    // This is mainly to ensure that the component passes the markdown to the rendering library properly. Testing the library itself is out of scope
    test("should render markdown code that is passed to it as children", () => {
        render(<MarkdownProse>**bolded**</MarkdownProse>);
        const strong = screen.queryByRole("strong");

        expect(strong).toBeInTheDocument();
        expect(strong).toHaveTextContent("bolded");
    });
});
