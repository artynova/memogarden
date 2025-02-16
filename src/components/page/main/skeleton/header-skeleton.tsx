import { HomeButton } from "@/components/page/main/template/home-button";
import { Skeleton } from "@/components/shadcn/skeleton";
import AnimatedLoadingText from "@/components/page/main/skeleton/animated-loading-text";
import { cn } from "@/lib/ui/generic";

/**
 * Page header skeleton.
 *
 * @param props Component properties.
 * @param props.hideHomeButton Whether to hide the home button in the header, e.g., when rendering a header skeleton
 * for the home page (defaults to false).
 * @param props.className Custom classes.
 * @returns The component.
 */
export function HeaderSkeleton({
    hideHomeButton,
    className,
}: {
    hideHomeButton?: boolean;
    className?: string;
}) {
    return (
        <header className={cn("flex justify-between border-b bg-secondary shadow", className)}>
            {!hideHomeButton && <HomeButton />}
            <h1 className="flex shrink grow items-center justify-center text-xl font-bold text-secondary-foreground sm:text-2xl">
                <AnimatedLoadingText />
            </h1>
            <div className="inline-flex h-auto w-24 items-center justify-center overflow-hidden rounded-none px-12 py-4 sm:w-32">
                <div className="flex w-32 flex-col items-center space-y-2 px-6">
                    <Skeleton className="size-14 rounded-full border-foreground"></Skeleton>
                    <Skeleton className="h-4 w-16 rounded-full"></Skeleton>
                </div>
            </div>
        </header>
    );
}
