import { ControlledActionModal } from "@/components/modal/controlled-action-modal";
import { suppressWarning } from "@/test/logging";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

/**
 * Message that gets printed when a description is not supplied for the sheet element, which uses DialogContent internally.
 * Suppressed in most tests of this suite because description is omitted intentionally.
 */
const missingDescriptionMessage =
    "Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.";

describe(ControlledActionModal, () => {
    describe("given false value for 'open' prop", () => {
        test("should not render any modal elements", () => {
            suppressWarning(missingDescriptionMessage);

            render(
                <ControlledActionModal open={false} onOpenChange={() => {}} title="">
                    Content
                </ControlledActionModal>,
            );
            const dialog = screen.queryByRole("dialog");

            expect(dialog).not.toBeInTheDocument();
        });
    });

    describe("given true value for 'open' prop", () => {
        describe.each([{ title: "Modal 1" }, { title: "Some title" }])(
            "given title $title",
            ({ title }) => {
                test(`should render title as second-level heading`, () => {
                    suppressWarning(missingDescriptionMessage);

                    render(
                        <ControlledActionModal open={true} onOpenChange={() => {}} title={title}>
                            Content
                        </ControlledActionModal>,
                    );
                    const heading = screen.queryByRole("heading", { level: 2, name: title });

                    expect(heading).toBeInTheDocument();
                });

                describe("given no description", () => {
                    test(`should not render description paragraph`, () => {
                        suppressWarning(missingDescriptionMessage);

                        render(
                            <ControlledActionModal
                                open={true}
                                onOpenChange={() => {}}
                                title={title}
                            >
                                Content
                            </ControlledActionModal>,
                        );
                        const descriptionParagraph = screen.queryByRole("paragraph");

                        expect(descriptionParagraph).not.toBeInTheDocument();
                    });
                });

                describe.each([
                    { description: "Lorem ipsum dolor sit amet" },
                    { description: "Sliding modal." },
                ])("given description $description", ({ description }) => {
                    test(`should render description paragraph`, () => {
                        render(
                            <ControlledActionModal
                                open={true}
                                onOpenChange={() => {}}
                                title={title}
                                description={description}
                            >
                                Content
                            </ControlledActionModal>,
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
                    test("should render children", () => {
                        suppressWarning(missingDescriptionMessage);

                        render(
                            <ControlledActionModal
                                open={true}
                                onOpenChange={() => {}}
                                title={title}
                            >
                                {children}
                            </ControlledActionModal>,
                        );
                        const element = screen.queryByTestId(testId);

                        expect(element).toBeInTheDocument();
                        expect(element).toBeVisible();
                    });
                });

                describe("when close button is clicked", () => {
                    test("should call 'onOpenChange' callback with false vlaue", () => {
                        suppressWarning(missingDescriptionMessage);
                        const mockOnOpenChange = vi.fn();

                        render(
                            <ControlledActionModal
                                open={true}
                                onOpenChange={mockOnOpenChange}
                                title={title}
                            >
                                Content
                            </ControlledActionModal>,
                        );
                        const closeButton = screen.getByRole("button"); // There is only one button in the modal itself
                        fireEvent.click(closeButton);

                        expect(mockOnOpenChange).toHaveBeenCalledExactlyOnceWith(false);
                    });
                });

                describe("when dark background overlay is clicked", () => {
                    test("should call 'onOpenChange' callback with false vlaue", async () => {
                        suppressWarning(missingDescriptionMessage);
                        const mockOnOpenChange = vi.fn();

                        render(
                            <ControlledActionModal
                                open={true}
                                onOpenChange={mockOnOpenChange}
                                title={title}
                            >
                                Content
                            </ControlledActionModal>,
                        );
                        const overlay = screen.getByRole("dialog").previousElementSibling!;
                        await userEvent.click(overlay);

                        expect(mockOnOpenChange).toHaveBeenCalledExactlyOnceWith(false);
                    });
                });
            },
        );
    });
});
