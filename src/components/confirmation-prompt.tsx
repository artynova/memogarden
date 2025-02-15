// Strictly client component

import { Button } from "@/components/shadcn/button";
import { Check, X } from "lucide-react";
import React from "react";

/**
 * Confirmation prompt with "confirm" and "cancel" buttons, proceeding with some action only if the user confirms their
 * intent.
 *
 * Strictly client component, must be used within the client boundary.
 *
 * @param props Component properties.
 * @param props.onConfirm Confirmation callback (executed if the user selects the "confirm" option).
 * @param props.onCancel Cancellation callback (executed if the user selects the "cancel" option).
 * @returns The component.
 */
export function ConfirmationPrompt({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="flex justify-center space-x-2">
            <Button size="lg" variant="destructive" onClick={onConfirm}>
                <span>Confirm</span>
                <Check aria-label="Confirm icon" />
            </Button>
            <Button size="lg" variant="outline" onClick={onCancel}>
                <span>Cancel</span>
                <X aria-label="Cancel icon" />
            </Button>
        </div>
    );
}
