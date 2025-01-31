// Strictly client component

import { Button } from "@/components/ui/base/button";
import { Check, X } from "lucide-react";
import React from "react";

export interface ConfirmationPromptProps {
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Content of a confirmation modal for some action, which makes sure the user did not initiate the action accidentally.
 *
 * @param onConfirm Action to be performed when the user selects the "confirm" option.
 * @param onCancel Action to be performed when the user selects the "cancel" option.
 */
export function ConfirmationPrompt({ onConfirm, onCancel }: ConfirmationPromptProps) {
    return (
        <div className={"flex justify-center space-x-2"}>
            <Button size={"lg"} variant={"destructive"} onClick={onConfirm}>
                <span>Confirm</span>
                <Check aria-label={"Confirm icon"} />
            </Button>
            <Button size={"lg"} variant={"outline"} onClick={onCancel}>
                <span>Cancel</span>
                <X aria-label={"Cancel icon"} />
            </Button>
        </div>
    );
}
