import { ControlledActionModal } from "@/components/modal/controlled-action-modal";
import { ControlledModalCollection } from "@/components/modal/controlled-modal-collection";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/modal/controlled-action-modal");

const mockedControlledActionModal = vi.mocked(ControlledActionModal);

describe(ControlledModalCollection, () => {
    describe.each([
        {
            modals: [
                { title: "Title 1", children: "Some content" },
                { title: "Test title", description: "Lorem ipsum", children: "Dolor sit amet" },
                { title: "Heading", description: "Test description", children: <input /> },
            ],
        },
        {
            modals: [
                { title: "Create card", children: <input /> },
                {
                    title: "Delete card",
                    description: "Delete a card.",
                    children: <button>Delete</button>,
                },
            ],
        },
    ])("given modals $modals", ({ modals }) => {
        describe.each(modals.map((modal, index) => ({ modal, index })))(
            "for modal $modal",
            ({ modal, index }) => {
                test("should render modal with correct static data", () => {
                    render(
                        <ControlledModalCollection
                            currentModalIndex={null}
                            modals={modals}
                            onCurrentModalChange={() => {}}
                        />,
                    );

                    expect(mockedControlledActionModal).toHaveBeenNthCalledWithProps(
                        index + 1,
                        modal,
                    );
                });
            },
        );

        describe.each([
            { currentModal: null, currentIndex: null },
            ...[...modals.keys()].map((currentIndex) => ({ currentIndex })),
        ])("given current modal index $currentIndex", ({ currentIndex }) => {
            describe.each([...modals.keys()].map((index) => ({ index })))(
                "for modal at index $index",
                ({ index }) => {
                    if (index === currentIndex) {
                        test("should render modal as open", () => {
                            render(
                                <ControlledModalCollection
                                    currentModalIndex={currentIndex}
                                    modals={modals}
                                    onCurrentModalChange={() => {}}
                                />,
                            );

                            expect(mockedControlledActionModal).toHaveBeenNthCalledWithProps(
                                index + 1,
                                { open: true },
                            );
                        });

                        describe("when modal open state changes", () => {
                            test("should call 'onCurrentModalChange' callback with new index 'null'", () => {
                                mockedControlledActionModal.mockImplementation(
                                    ({ open, onOpenChange }) => {
                                        if (open) onOpenChange(false); // Simulate closing the current (open) modal immediately, since the test is not rendering the real modal

                                        return <></>;
                                    },
                                );
                                const mockOnCurrentModalChange = vi.fn();

                                render(
                                    <ControlledModalCollection
                                        currentModalIndex={currentIndex}
                                        modals={modals}
                                        onCurrentModalChange={mockOnCurrentModalChange}
                                    />,
                                );

                                expect(mockOnCurrentModalChange).toHaveBeenCalledExactlyOnceWith(
                                    null,
                                );
                            });
                        });
                    } else {
                        test("should render modal as closed", () => {
                            render(
                                <ControlledModalCollection
                                    currentModalIndex={currentIndex}
                                    modals={modals}
                                    onCurrentModalChange={() => {}}
                                />,
                            );

                            expect(mockedControlledActionModal).toHaveBeenNthCalledWithProps(
                                index + 1,
                                { open: false },
                            );
                        });

                        if (currentIndex !== null) {
                            describe("when modal open state changes", () => {
                                test(`should call 'onCurrentModalChange' callback with new index ${index}`, () => {
                                    mockedControlledActionModal.mockImplementation(
                                        ({ open, onOpenChange }) => {
                                            if (open) onOpenChange(false); // Simulate closing the current (open) modal immediately, since the test is not rendering the real modal

                                            return <></>;
                                        },
                                    );
                                    const mockOnCurrentModalChange = vi.fn();

                                    render(
                                        <ControlledModalCollection
                                            currentModalIndex={currentIndex}
                                            modals={modals}
                                            onCurrentModalChange={mockOnCurrentModalChange}
                                        />,
                                    );

                                    expect(
                                        mockOnCurrentModalChange,
                                    ).toHaveBeenCalledExactlyOnceWith(null);
                                });
                            });
                        }
                    }
                },
            );
        });
    });
});
