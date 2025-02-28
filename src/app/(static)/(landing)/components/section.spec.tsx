import { Section } from "@/app/(static)/(landing)/components/section";
import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe(Section, () => {
    test("should use semantic section tag", () => {
        const { container } = render(<Section>Content</Section>);
        const sections = container.getElementsByTagName("section");

        expect(sections.length).toEqual(1);
    });

    test.each([
        { children: <div>Content</div>, checkTag: "div" },
        { children: <p>Lorem ipsum</p>, checkTag: "p" },
        { children: <h2>This is a heading</h2>, checkTag: "h2" },
    ])("should render children", ({ children, checkTag }) => {
        const { container } = render(<Section>{children}</Section>);
        const renderedChildren = container.getElementsByTagName(checkTag);

        expect(renderedChildren.length).toEqual(1);
    });
});
