import { ThemeProvider } from "@/components/theme/theme-provider";
import { HeaderSkeleton } from "@/components/page/skeleton/header-skeleton";
import { LoadingSpinner } from "@/components/page/skeleton/loading-spinner";
import { FooterSkeleton } from "@/components/page/skeleton/footer-skeleton";

/**
 * Component for creating page placeholders in various routes of the functional app (i.e., not for the static pages).
 * Generally mimics the arrangement of the {@link PageTemplate}, but without the data.
 *
 * @param props Component properties.
 * @param props.hideHomeButton Whether to hide the home button in the header, e.g., when rendering a header skeleton
 * for the home page (defaults to false).
 * @param props.hideFooter Whether to hide the page footer entirely, e.g., when rendering a skeleton for a page without
 * footer actions (defaults to false).
 * @returns The component.
 */
export function PageSkeleton({
    hideHomeButton,
    hideFooter,
}: {
    hideHomeButton?: boolean;
    hideFooter?: boolean;
}) {
    return (
        <ThemeProvider>
            <div className="flex h-screen w-full flex-col">
                <HeaderSkeleton
                    hideHomeButton={hideHomeButton}
                    className="sticky top-0 z-10 shrink-0"
                />
                <main className="grow">
                    <div className="flex size-full items-center justify-center">
                        <LoadingSpinner className="size-24 border-8" />
                    </div>
                </main>
                {!hideFooter && <FooterSkeleton className="sticky bottom-0 z-10 shrink-0" />}
            </div>
        </ThemeProvider>
    );
}
