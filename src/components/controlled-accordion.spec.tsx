import { describe, expect, test, vi } from "vitest";
import { ControlledAccordion } from "@/components/controlled-accordion";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { stringifyWithSingleSpaces } from "@/test/display";

describe.each([
    {
        items: [
            {
                heading: <span data-testid="h-1">Heading 1</span>,
                content: <span data-testid="c-1">Content 1</span>,
            },
            {
                heading: <span data-testid="h-2">Heading 2</span>,
                content: <span data-testid="c-2">Content 2</span>,
            },
        ],
    },
    {
        items: [
            {
                heading: <span data-testid="h-1">Fruit</span>,
                content: <span data-testid="c-1">Apples, oranges, bananas</span>,
            },
            {
                heading: <span data-testid="h-2">Vegetables</span>,
                content: <span data-testid="c-2">Potatoes, tomatoes, carrots</span>,
            },
            {
                heading: <span data-testid="h-3">Dairy</span>,
                content: <span data-testid="c-3">Milk, cheese, cream</span>,
            },
        ],
    },
])(ControlledAccordion, ({ items }) => {
    const itemsString = stringifyWithSingleSpaces(
        items.map((item) => ({
            heading: renderToStaticMarkup(item.heading),
            content: renderToStaticMarkup(item.content),
        })),
    );

    test(`should correctly render all headings when passed items ${itemsString}`, () => {
        render(
            <ControlledAccordion items={items} currentIndex={0} onCurrentIndexChange={() => {}} />,
        );
        const headings = screen.getAllByRole("heading", { level: 3 });

        headings.forEach((element, index) => {
            const customHeadingContent = screen.getByTestId(`h-${index + 1}`);
            expect(element).toContainElement(customHeadingContent);
        });
    });

    test.each(items.map((_, index) => ({ currentIndex: index })))(
        `should render the current item and only the current item as expanded when current item index is $currentIndex and passed items are ${itemsString}`,
        ({ currentIndex }) => {
            render(
                <ControlledAccordion
                    items={items}
                    currentIndex={currentIndex}
                    onCurrentIndexChange={() => {}}
                />,
            );
            const headings = screen.getAllByRole("heading", { level: 3 });

            headings.forEach((element, index) => {
                const contentDiv = element.nextSibling;
                expect(contentDiv).toBeInTheDocument();
                if (index === currentIndex) {
                    expect(contentDiv).toBeVisible();
                    expect(contentDiv).toHaveAttribute("data-state", "open");
                    const customItemContent = screen.getByTestId(`c-${index + 1}`);
                    expect(contentDiv).toContainElement(customItemContent);
                } else {
                    expect(contentDiv).not.toBeVisible();
                    expect(contentDiv).toHaveAttribute("data-state", "closed");
                    expect(contentDiv?.childNodes.length).toEqual(0);
                }
            });
        },
    );

    test.each(
        items.map((_, index) => ({ currentIndex: index, targetIndex: (index + 1) % items.length })),
    )(
        `should call the active index change callback with index $targetIndex when a heading at that index is clicked while the currently expanded heading's index is $currentIndex and passed items are ${itemsString}`,
        ({ currentIndex, targetIndex }) => {
            const mockOnIndexChange = vi.fn();

            render(
                <ControlledAccordion
                    items={items}
                    currentIndex={currentIndex}
                    onCurrentIndexChange={mockOnIndexChange}
                />,
            );
            const targetHeading = screen.getByTestId(`h-${targetIndex + 1}`);
            fireEvent.click(targetHeading);
            expect(mockOnIndexChange).toHaveBeenCalledExactlyOnceWith(targetIndex);
        },
    );

    test.each(items.map((_, index) => ({ currentIndex: index })))(
        `should call not call the active index change callback when the currently expanded heading is at index $currentIndex, that same heading is clicked again, and passed items are ${itemsString}`,
        ({ currentIndex }) => {
            const mockOnIndexChange = vi.fn();

            render(
                <ControlledAccordion
                    items={items}
                    currentIndex={currentIndex}
                    onCurrentIndexChange={mockOnIndexChange}
                />,
            );
            const targetHeading = screen.getByTestId(`h-${currentIndex + 1}`);
            fireEvent.click(targetHeading);
            expect(mockOnIndexChange).not.toHaveBeenCalled();
        },
    );
});
