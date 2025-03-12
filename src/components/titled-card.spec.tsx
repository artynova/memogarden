import { describe, expect, test } from "vitest";
import { TitledCard } from "@/components/titled-card";
import { render, screen } from "@testing-library/react";

describe(TitledCard, () => {
    describe.each([{ title: "Card" }, { title: "Lorem ipsum" }])(
        "given title $title",
        ({ title }) => {
            test("should render title as second-level heading", () => {
                render(<TitledCard title={title}>Content</TitledCard>);
                const heading = screen.queryByRole("heading", { level: 2, name: title });

                expect(heading).toBeInTheDocument();
            });

            describe("given no description", () => {
                test(`should not render description paragraph`, () => {
                    render(<TitledCard title={title}>Content</TitledCard>);
                    const descriptionParagraph = screen.queryByRole("paragraph");

                    expect(descriptionParagraph).not.toBeInTheDocument();
                });
            });

            describe.each([
                { description: "Lorem ipsum dolor sit amet" },
                { description: "Titled card." },
            ])("given description $description", ({ description }) => {
                test(`should render description paragraph`, () => {
                    render(
                        <TitledCard title={title} description={description}>
                            Content
                        </TitledCard>,
                    );
                    const descriptionParagraph = screen.queryByRole("paragraph");

                    expect(descriptionParagraph).toBeInTheDocument();
                    expect(descriptionParagraph).toHaveTextContent(description);
                });
            });

            describe.each([
                {
                    children: <div data-testid="test_content">Some content</div>,
                    testId: "test_content",
                },
                {
                    children: <h3 data-testid="test_heading">Lorem ipsum</h3>,
                    testId: "test_heading",
                },
            ])("given children $children", ({ children, testId }) => {
                test("should render full content given content with test ID $testId", () => {
                    render(<TitledCard title={title}>{children}</TitledCard>);
                    const element = screen.queryByTestId(testId);

                    expect(element).toBeInTheDocument();
                });
            });
        },
    );
});
