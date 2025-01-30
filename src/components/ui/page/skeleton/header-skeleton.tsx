import { cn } from "@/lib/utils";
import { HomeButton } from "@/components/ui/page/template/home-button";
import { Skeleton } from "@/components/ui/base/skeleton";
import AnimatedLoadingText from "@/components/ui/page/skeleton/animated-loading-text";

export interface HeaderSkeletonProps {
    hideHomeButton?: boolean;
    className?: string;
}

export function HeaderSkeleton({ hideHomeButton, className }: HeaderSkeletonProps) {
    return (
        <header className={cn("flex justify-between border-b bg-secondary shadow", className)}>
            {!hideHomeButton && <HomeButton />}
            <div className={"flex grow-[5] items-center justify-between py-6"}>
                <h1 className="flex grow-[3] justify-center text-xl font-bold text-secondary-foreground">
                    <AnimatedLoadingText />
                </h1>
            </div>
            <div className={"inline-flex h-auto w-32 items-center justify-center px-4 py-2"}>
                <div className={"flex w-32 flex-col items-center space-y-2 px-6 py-3"}>
                    <Skeleton className={"size-16 rounded-full border-foreground"}></Skeleton>
                    <Skeleton className={"h-4 w-16 rounded-full"}></Skeleton>
                </div>
            </div>
        </header>
    );
}
