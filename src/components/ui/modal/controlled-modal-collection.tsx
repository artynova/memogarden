import { ReactNode } from "react";
import { ControlledActionModal } from "@/components/ui/modal/controlled-action-modal";

export interface ModalData {
    title: string;
    description?: string;
    children: ReactNode;
}

export interface ControlledModalCollectionProps {
    modals: ModalData[];
    currentModalIndex: number | null;
    onCurrentModalChange: (newModalIndex: number | null) => void;
}

/**
 * A collection of any number of mutually exclusive sliding modals (only one modal can be open at a time).
 * This component is controlled, i.e., the state management for the current modal index occurs elsewhere.
 *
 * @param modals Data necessary to render all modals (indices in this array are also used to identify the modals).
 * @param currentModalIndex Index of the current modal in the array.
 * @param onCurrentModalChange Callback that is triggered when the currently open modal changes to a different one.
 */
export function ControlledModalCollection({
    modals,
    currentModalIndex,
    onCurrentModalChange,
}: ControlledModalCollectionProps) {
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
