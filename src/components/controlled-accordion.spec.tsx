import { describe, expect, test, vi } from "vitest";
import { ControlledAccordion } from "@/components/controlled-accordion";
import { fireEvent, render, screen } from "@testing-library/react";

/**
 * Creates a deterministic test ID for a heading based on the item index.
 *
 * @param index Item index (0-based).
 * @returns Test ID unique to given index.
 */
function makeHeadingTestId(index: number) {
    return `h-${index + 1}`;
}

/**
 * Creates a deterministic test ID for a content container based on the item index.
 *
 * @param index Item index (0-based).
 * @returns Test ID unique to given index.
 */
function makeContentTestId(index: number) {
    return `c-${index + 1}`;
}

describe(ControlledAccordion, () => {
    describe.each([
        {
            items: [0, 1].map((index) => ({
                heading: (
                    <div data-testid={makeHeadingTestId(index)}>{"Heading " + (index + 1)}</div>
                ),
                content: (
                    <div data-testid={makeContentTestId(index)}>{"Content " + (index + 1)}</div>
                ),
            })),
        },
        {
            items: [0, 1, 2, 3].map((index) => ({
                heading: <div data-testid={makeHeadingTestId(index)}>{"Step " + (index + 1)}</div>,
                content: (
                    <div data-testid={makeContentTestId(index)}>
                        {"Description of step " + (index + 1)}
                    </div>
                ),
            })),
        },
    ])("given items $items", ({ items }) => {
        describe.each(items.map((currentItem, currentIndex) => ({ currentItem, currentIndex })))(
            "given current item $currentItem",
            ({ currentIndex }) => {
                describe.each(items.map((item, index) => ({ item, index })))(
                    "for item $item",
                    ({ index }) => {
                        test("should correctly render heading", () => {
                            render(
                                <ControlledAccordion
                                    items={items}
                                    currentIndex={currentIndex}
                                    onCurrentIndexChange={() => {}}
                                />,
                            );
                            const heading = screen.getAllByRole("heading", { level: 3 })[index];
                            const customHeadingContent = screen.getByTestId(
                                makeHeadingTestId(index),
                            );

                            expect(heading).toBeInTheDocument();
                            expect(heading).toContainElement(customHeadingContent);
                        });
                        if (index === currentIndex) {
                            test(`should render item as expanded`, () => {
                                render(
                                    <ControlledAccordion
                                        items={items}
                                        currentIndex={currentIndex}
                                        onCurrentIndexChange={() => {}}
                                    />,
                                );
                                const heading = screen.getAllByRole("heading", { level: 3 })[
                                    currentIndex
                                ];
                                const contentDiv = heading?.nextSibling;
                                const customItemContent = screen.getByTestId(
                                    makeContentTestId(index),
                                );

                                expect(heading).toBeInTheDocument();
                                expect(contentDiv).toBeVisible();
                                expect(contentDiv).toHaveAttribute("data-state", "open");
                                expect(contentDiv).toContainElement(customItemContent);
                            });

                            describe("when item heading is clicked", () => {
                                test("should not call 'onCurrentIndexChange' callback", () => {
                                    const mockOnIndexChange = vi.fn();

                                    render(
                                        <ControlledAccordion
                                            items={items}
                                            currentIndex={currentIndex}
                                            onCurrentIndexChange={mockOnIndexChange}
                                        />,
                                    );
                                    const targetHeading = screen.getByTestId(
                                        `h-${currentIndex + 1}`,
                                    );
                                    fireEvent.click(targetHeading);

                                    expect(mockOnIndexChange).not.toHaveBeenCalled();
                                });
                            });
                        } else {
                            test("should render item as collapsed", () => {
                                render(
                                    <ControlledAccordion
                                        items={items}
                                        currentIndex={currentIndex}
                                        onCurrentIndexChange={() => {}}
                                    />,
                                );
                                const heading = screen.getAllByRole("heading", { level: 3 })[index];
                                const contentDiv = heading?.nextSibling;

                                expect(contentDiv).toBeInTheDocument();
                                expect(contentDiv).not.toBeVisible();
                                expect(contentDiv).toHaveAttribute("data-state", "closed");
                                expect(contentDiv).toBeEmptyDOMElement();
                            });

                            describe("when item heading is clicked", () => {
                                test("should call 'onCurrentIndexChange' callback with new index", () => {
                                    const mockOnIndexChange = vi.fn();

                                    render(
                                        <ControlledAccordion
                                            items={items}
                                            currentIndex={currentIndex}
                                            onCurrentIndexChange={mockOnIndexChange}
                                        />,
                                    );
                                    const targetHeading = screen.getByTestId(`h-${index + 1}`);
                                    fireEvent.click(targetHeading);

                                    expect(mockOnIndexChange).toHaveBeenCalledExactlyOnceWith(
                                        index,
                                    );
                                });
                            });
                        }
                    },
                );
            },
        );
    });
});
