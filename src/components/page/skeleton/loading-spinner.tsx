import { cn } from "@/lib/ui/generic";

/**
 * Traditional loading spinner that can be displayed in place of any loading content..
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "size-8 animate-spin rounded-full border-4 border-foreground border-t-transparent",
                className,
            )}
            role="status"
            aria-label="Loading"
        />
    );
}
