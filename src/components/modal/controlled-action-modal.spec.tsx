import { ControlledActionModal } from "@/components/modal/controlled-action-modal";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

describe(ControlledActionModal, () => {
    test.each([{ title: "Modal 1" }, { title: "Some title" }])(
        `should render title in a second-level heading given title title`,
        ({ title }) => {
            render(
                <ControlledActionModal open={true} onOpenChange={() => {}} title={title}>
                    Content
                </ControlledActionModal>,
            );
            const heading = screen.queryByRole("heading", { level: 2, name: title });

            expect(heading).toBeInTheDocument();
        },
    );

    test.each([{ description: "Lorem ipsum dolor sit amet" }, { description: "Sliding modal." }])(
        `should render a description paragraph given description description`,
        ({ description }) => {
            render(
                <ControlledActionModal
                    open={true}
                    onOpenChange={() => {}}
                    title=""
                    description={description}
                >
                    Content
                </ControlledActionModal>,
            );
            const descriptionParagraph = screen.queryByRole("paragraph");

            expect(descriptionParagraph).toBeInTheDocument();
            expect(descriptionParagraph).toHaveTextContent(description);
        },
    );

    test(`should not render a description if a value is not provided for it`, () => {
        render(
            <ControlledActionModal open={true} onOpenChange={() => {}} title="">
                Content
            </ControlledActionModal>,
        );
        const descriptionParagraph = screen.queryByRole("paragraph");

        expect(descriptionParagraph).not.toBeInTheDocument();
    });

    test.each([
        { content: <div data-testid="test_content">Some content</div>, testId: "test_content" },
        { content: <h3 data-testid="test_heading">Lorem ipsum</h3>, testId: "test_heading" },
    ])("should render full content given content with test ID $testId", ({ content, testId }) => {
        render(
            <ControlledActionModal open={true} onOpenChange={() => {}} title="">
                {content}
            </ControlledActionModal>,
        );
        const element = screen.queryByTestId(testId);

        expect(element).toBeInTheDocument();
    });

    test("should call 'onOpenChange' callback with 'false' when the closing cross button is clicked", () => {
        const mockOnOpenChange = vi.fn();

        render(
            <ControlledActionModal open={true} onOpenChange={mockOnOpenChange} title="">
                Content
            </ControlledActionModal>,
        );
        const closeButton = screen.getByRole("button"); // There is only one button in the modal itself
        fireEvent.click(closeButton);

        expect(mockOnOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    test("should call 'onOpenChange' callback with 'false' when the dark background overlay", async () => {
        const mockOnOpenChange = vi.fn();

        render(
            <ControlledActionModal open={true} onOpenChange={mockOnOpenChange} title="">
                Content
            </ControlledActionModal>,
        );
        const overlay = screen.getByRole("dialog").previousElementSibling!;
        await userEvent.click(overlay);

        expect(mockOnOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });

    test("should not render any DOM elements when the 'open' property is set to 'false'", () => {
        render(
            <ControlledActionModal open={false} onOpenChange={() => {}} title="">
                Content
            </ControlledActionModal>,
        );
        const dialog = screen.queryByRole("dialog");

        expect(dialog).not.toBeInTheDocument();
    });
});
