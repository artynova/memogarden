import { ReactNode } from "react";
import { SelectUser } from "@/server/data/services/user";
import { Header } from "@/components/ui/page/header";
import { Footer, FooterActionData } from "@/components/ui/page/footer";
import { ThemeProvider } from "@/components/ui/theme-provider";

export type { FooterActionData };

export interface PageTemplateProps {
    /**
     * Text to be displayed in the header.
     */
    title: string;
    user: SelectUser;
    /**
     * Whether to hide the "home" button - optional, assumed false if missing.
     */
    hideHomeButton?: boolean;
    /**
     * List of main functional buttons of the page. Will be displayed in the page footer.
     */
    footerActions: FooterActionData[];
    children: ReactNode;
}

/**
 * Component that represents common elements of different functional pages within the main MemoGarden application.
 *
 * All pages have headers with the same structure but different text (except for the home page header,
 * which does not have the "home" button), and all pages have footers containing main functional buttons that only
 * differ in icons and URLs. Any content placed inside this component will be placed in the "main" element.
 */
export function PageTemplate({
    title,
    user,
    hideHomeButton,
    footerActions,
    children,
}: PageTemplateProps) {
    const theme = user.darkMode === null ? "system" : user.darkMode ? "dark" : "light";
    // TODO potential improvement - add loading skeletons
    return (
        <ThemeProvider theme={theme}>
            <div className="flex h-screen w-full flex-col">
                <Header
                    title={title}
                    user={user}
                    hideHomeButton={hideHomeButton}
                    className={"sticky top-0 z-10 shrink-0"}
                />
                <main className="grow">{children}</main>
                <Footer buttons={footerActions} className={"sticky bottom-0 z-10 shrink-0"} />
            </div>
        </ThemeProvider>
    );
}
