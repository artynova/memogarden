import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/shadcn/sheet";
import { ReactNode } from "react";

import { cn } from "@/lib/ui/generic";

/**
 * Overlay modal sliding in from the bottom, with externally managed state.
 *
 * @param props Component properties.
 * @param props.open Whether the modal is open or not.
 * @param props.onOpenChange Callback for when the open state change is initiated from inside the modal (e.g., when
 * the user clicks the "close" button).
 * @param props.title Title at the top of the modal.
 * @param props.description Description below the title.
 * @param props.className Custom classes.
 * @param props.children Content.
 * @returns The component.
 */
export function ControlledActionModal({
    open,
    onOpenChange,
    title,
    description,
    className,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className={cn("max-h-screen space-y-3 overflow-y-scroll", className)}
            >
                <SheetHeader>
                    <SheetTitle className="text-center font-bold">{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
