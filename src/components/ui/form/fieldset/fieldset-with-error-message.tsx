"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { FieldsetContext } from "@/components/ui/form/fieldset/context";

export interface FieldsetProps {
    name: string;
    error?: string;
    className?: string;
    children?: React.ReactNode;
}

export function FieldsetWithErrorMessage({
    name,
    error,
    className,
    children,
    ...props
}: FieldsetProps) {
    const id = useId();
    const messageId = `${id}-message`;

    return (
        <fieldset
            id={id}
            name={name}
            className={cn("space-y-2", className)}
            aria-invalid={!!error}
            aria-describedby={error ? messageId : ""}
            {...props}
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
