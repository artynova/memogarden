"use client";
import React, { useId } from "react";
import { FieldsetContext } from "@/components/form/fieldset/context";
import { cn } from "@/lib/ui/generic";

/**
 * Fieldset with a possible common error message for all fields inside it.
 *
 * @param props Component properties.
 * @param props.name Name of the fieldset for identification.
 * @param props.error Error message.
 * @param props.className Custom classes.
 * @param props.children Content.
 * @returns The component.
 */
export function FieldsetWithErrorMessage({
    name,
    error,
    className,
    children,
}: {
    name: string;
    error?: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const id = useId();
    const messageId = `${id}-message`;

    return (
        <fieldset
            id={id}
            name={name}
            className={cn("space-y-2", className)}
            aria-invalid={!!error}
            aria-describedby={error ? messageId : undefined}
        >
            <FieldsetContext.Provider value={{ error }}>{children}</FieldsetContext.Provider>
            {error && (
                <p id={messageId} className="text-[0.8rem] font-medium text-destructive">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
