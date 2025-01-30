import { Skeleton } from "@/components/ui/base/skeleton";
import { cn } from "@/lib/utils";

export interface AvatarSkeletonProps {
    className?: string;
}

export function AvatarSkeleton({ className }: AvatarSkeletonProps) {
    return <Skeleton className={cn("rounded-full", className)} />;
}
