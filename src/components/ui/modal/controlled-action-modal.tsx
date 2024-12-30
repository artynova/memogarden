import { Sheet, SheetContent, SheetDescription, SheetHeader } from "@/components/ui/base/sheet";
import { ReactNode } from "react";
import { DialogTitle } from "@/components/ui/base/dialog";
import { cn } from "@/lib/utils";

export interface ControlledOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Component that creates an overlay modal sliding in from the bottom. Its "open" state is managed externally and passed
 * through props.
 *
 * Custom classes, if specified, are applied to the SheetContent component.
 */
export function ControlledActionModal({
    open,
    onOpenChange,
    title,
    description,
    className,
    children,
}: ControlledOverlayProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={"bottom"}
                className={cn("max-h-screen overflow-y-scroll", className)}
            >
                <SheetHeader>
                    <DialogTitle className={"text-center font-bold"}>{title}</DialogTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
