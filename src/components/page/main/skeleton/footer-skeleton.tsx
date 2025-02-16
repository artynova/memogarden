import { cn } from "@/lib/ui/generic";

/**
 * Page footer skeleton.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function FooterSkeleton({ className }: { className?: string }) {
    return (
        <footer
            className={cn(
                "flex h-28 flex-nowrap justify-center border-t bg-secondary shadow",
                className,
            )}
        />
    );
}
