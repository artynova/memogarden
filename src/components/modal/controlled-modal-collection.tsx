import { ReactNode } from "react";
import { ControlledActionModal } from "@/components/modal/controlled-action-modal";

/**
 * Static data for a single sliding modal.
 */
export interface ModalData {
    /**
     * Modal's title.
     */
    title: string;
    /**
     * Modal's description.
     */
    description?: string;
    /**
     * Modal's content.
     */
    children: ReactNode;
}

/**
 * A collection of any number of mutually exclusive sliding modals (only one modal can be open at a time) with
 * externally managed state.
 *
 * @param props Component properties.
 * @param props.modals Array of modal data entries (indices in this array are also used to identify the modals).
 * @param props.currentModalIndex Index of the currently open modal in the array. `null` means that no modal is open.
 * @param props.onCurrentModalChange Callback for when the current modal index change is initiated from inside the
 * component (e.g., the user closes the current modal with the "close" button).
 * @returns The component.
 */
export function ControlledModalCollection({
    modals,
    currentModalIndex,
    onCurrentModalChange,
}: {
    modals: ModalData[];
    currentModalIndex: number | null;
    onCurrentModalChange: (newModalIndex: number | null) => void;
}) {
    return (
        <>
            {modals.map((modal, index) => (
                <ControlledActionModal
                    key={index}
                    open={currentModalIndex === index}
                    onOpenChange={
                        currentModalIndex === index
                            ? () => onCurrentModalChange(null)
                            : () => onCurrentModalChange(index)
                    }
                    title={modal.title}
                    description={modal.description}
                >
                    {modal.children}
                </ControlledActionModal>
            ))}
        </>
    );
}
