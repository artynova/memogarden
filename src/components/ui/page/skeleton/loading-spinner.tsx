import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
    className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
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
