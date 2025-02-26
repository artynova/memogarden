import { ControlledActionModal } from "@/components/modal/controlled-action-modal";
import { ControlledModalCollection } from "@/components/modal/controlled-modal-collection";
import { stringifyWithSingleSpaces } from "@/test/display";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/modal/controlled-action-modal");

const mockedControlledActionModal = vi.mocked(ControlledActionModal);

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
])(ControlledModalCollection, ({ modals }) => {
    const modalsString = stringifyWithSingleSpaces(modals);

    test(`should render all modals with correct static data given static data ${modalsString}`, () => {
        render(
            <ControlledModalCollection
                currentModalIndex={null}
                modals={modals}
                onCurrentModalChange={() => {}}
            />,
        );

        modals.forEach((modal, index) => {
            expect(mockedControlledActionModal).toHaveBeenNthCalledWith(
                index + 1,
                expect.objectContaining(modal),
                {},
            );
        });
    });

    test.each(
        modals.map((_, index) => ({
            currentIndex: index,
        })),
    )(
        `should set modal at index $currentIndex as open given modals ${modalsString} and current index $currentIndex`,
        ({ currentIndex }) => {
            render(
                <ControlledModalCollection
                    currentModalIndex={currentIndex}
                    modals={modals}
                    onCurrentModalChange={() => {}}
                />,
            );

            expect(mockedControlledActionModal).toHaveBeenNthCalledWith(
                currentIndex + 1,
                expect.objectContaining({ open: true }),
                {},
            );
        },
    );

    test.each(
        modals.map((_, index) => ({
            currentIndex: index,
        })),
    )(
        `should call 'onCurrentModalChange' callback with new index 'null' when the open state of the modal at index $currentIndex changes given modals ${modalsString} and current index $currentIndex`,
        ({ currentIndex }) => {
            mockedControlledActionModal.mockImplementation(({ open, onOpenChange }) => {
                if (open) onOpenChange(false); // Simulate closing the current (open) modal immediately, since the test is not rendering the real modal

                return <></>;
            });
            const mockOnCurrentModalChange = vi.fn();

            render(
                <ControlledModalCollection
                    currentModalIndex={currentIndex}
                    modals={modals}
                    onCurrentModalChange={mockOnCurrentModalChange}
                />,
            );

            expect(mockOnCurrentModalChange).toHaveBeenCalledExactlyOnceWith(null);
        },
    );

    test.each(
        modals.map((_, index) => ({
            currentIndex: index,
        })),
    )(
        `should set all modals other than the one at index $currentIndex as closed given modals ${modalsString} and current index $currentIndex`,
        ({ currentIndex }) => {
            render(
                <ControlledModalCollection
                    currentModalIndex={currentIndex}
                    modals={modals}
                    onCurrentModalChange={() => {}}
                />,
            );

            modals.forEach((_, index) => {
                if (index === currentIndex) return;

                expect(mockedControlledActionModal).toHaveBeenNthCalledWith(
                    index + 1,
                    expect.objectContaining({ open: false }),
                    {},
                );
            });
        },
    );

    test.each(
        modals.map((_, index) => ({
            currentIndex: index,
        })),
    )(
        `should call 'onCurrentModalChange' callback with the index of the modal when the modal's open state changes for all modals except the modal at index $currentIndex given modals ${modalsString} and current index $currentIndex`,
        ({ currentIndex }) => {
            mockedControlledActionModal.mockImplementation(({ open, onOpenChange }) => {
                onOpenChange(!open); // Simulate trying to flip the state of every modal immediately, since the test is not rendering real modals

                return <></>;
            });
            const mockOnCurrentModalChange = vi.fn();

            render(
                <ControlledModalCollection
                    currentModalIndex={currentIndex}
                    modals={modals}
                    onCurrentModalChange={mockOnCurrentModalChange}
                />,
            );

            modals.forEach((_, index) => {
                if (index === currentIndex) return;

                expect(mockOnCurrentModalChange).toHaveBeenNthCalledWith(index + 1, index);
            });
        },
    );

    test(`should set all modals as closed given modals ${modalsString} and current index 'null'`, () => {
        render(
            <ControlledModalCollection
                currentModalIndex={null}
                modals={modals}
                onCurrentModalChange={() => {}}
            />,
        );

        modals.forEach((_, index) => {
            expect(mockedControlledActionModal).toHaveBeenNthCalledWith(
                index + 1,
                expect.objectContaining({ open: false }),
                {},
            );
        });
    });
});
