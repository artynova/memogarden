import { describe, expect, test } from "vitest";
import { TitledCard } from "@/components/titled-card";
import { render, screen } from "@testing-library/react";

describe(TitledCard, () => {
    test("should render the title text inside a second-level heading", () => {
        render(<TitledCard title="Test">Content</TitledCard>);
        const heading = screen.queryByRole("heading", { level: 2, name: "Test" });

        expect(heading).toBeInTheDocument();
    });

    test("should not render a description container if there is no description", () => {
        render(<TitledCard title="Test">Content</TitledCard>);
        const description = screen.getByRole("heading", {
            level: 2,
            name: "Test",
        }).nextElementSibling;

        expect(description).not.toBeInTheDocument();
    });

    test("should render the description text correctly", () => {
        render(
            <TitledCard title="Test" description="Desc">
                Content
            </TitledCard>,
        );
        const descriptionByContent = screen.queryByText("Desc");
        const descriptionByDom = screen.getByRole("heading", {
            level: 2,
            name: "Test",
        }).nextElementSibling;

        expect(descriptionByContent).toBeInTheDocument();
        expect(descriptionByContent).toBe(descriptionByDom);
    });

    test("should render the content", () => {
        render(<TitledCard title="Test">Content</TitledCard>);
        const content = screen.queryByText("Content");

        expect(content).toBeInTheDocument();
    });
});
