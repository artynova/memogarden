import { ThemeProvider } from "@/components/ui/theme-provider";
import { HeaderSkeleton } from "@/components/ui/page/skeleton/header-skeleton";
import { LoadingSpinner } from "@/components/ui/page/skeleton/loading-spinner";
import { FooterSkeleton } from "@/components/ui/page/skeleton/footer-skeleton";

export interface PagePlaceholderProps {
    hideHomeButton?: boolean;
    hideFooter?: boolean;
}

/**
 * Component for creating page placeholders in various routes of the functional app (i.e., not for the static pages).
 * Generally mimics the arrangement of the {@link PageTemplate}, but without the data.
 *
 * @param hideHomeButton If true, the button linking to the home page is not shown (e.g., if the placeholder is
 * intended for the home page itself).
 * @param hideFooter If true, the empty stand-in for the footer bar is not shown (e.g., if the placeholder is intended
 * for a page without footer actions).
 */
export function PageSkeleton({ hideHomeButton, hideFooter }: PagePlaceholderProps) {
    return (
        <ThemeProvider>
            <div className="flex h-screen w-full flex-col">
                <HeaderSkeleton
                    hideHomeButton={hideHomeButton}
                    className={"sticky top-0 z-10 shrink-0"}
                />
                <main className="grow">
                    <div className={"flex size-full items-center justify-center"}>
                        <LoadingSpinner className={"size-24 border-8"} />
                    </div>
                </main>
                {!hideFooter && <FooterSkeleton className={"sticky bottom-0 z-10 shrink-0"} />}
            </div>
        </ThemeProvider>
    );
}
