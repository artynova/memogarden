import { Skeleton } from "@/components/shadcn/skeleton";

import { cn } from "@/lib/ui/generic";

/**
 * Avatar image skeleton.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function AvatarSkeleton({ className }: { className?: string }) {
    return <Skeleton className={cn("rounded-full", className)} />;
}
