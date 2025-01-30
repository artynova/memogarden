import { cn } from "@/lib/utils";

export interface FooterSkeletonProps {
    className?: string;
}

export function FooterSkeleton({ className }: FooterSkeletonProps) {
    return (
        <footer
            className={cn(
                "flex h-28 flex-nowrap justify-center border-t bg-secondary shadow",
                className,
            )}
        />
    );
}
