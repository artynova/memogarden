import { ReactNode } from "react";
import { SelectUser } from "@/server/data/services/user";
import { Header } from "@/components/page/template/header";
import { Footer, FooterActionData } from "@/components/page/template/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";

import { darkModeToTheme } from "@/lib/ui/theme";

export type { FooterActionData };

/**
 * Template with structures common for all application pages (header, main part, functional footer). Children of this
 * component are placed inside the `<main>` element.
 *
 * @param props Component properties.
 * @param props.title Page title.
 * @param props.user User data.
 * @param props.hideHomeButton Whether to hide the home button in the header, e.g., when rendering a header skeleton
 * for the home page (defaults to false).
 * @param props.footerActions Footer action data.
 * @param props.children Content.
 * @returns The component.
 */
export function PageTemplate({
    title,
    user,
    hideHomeButton,
    footerActions,
    children,
}: {
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
    footerActions?: FooterActionData[];
    children: ReactNode;
}) {
    const theme = darkModeToTheme(user.darkMode);
    return (
        <ThemeProvider theme={theme}>
            <div className="flex h-screen w-full flex-col">
                <Header
                    title={title}
                    user={user}
                    hideHomeButton={hideHomeButton}
                    className="sticky top-0 z-10 shrink-0"
                />
                <main className="grow">{children}</main>
                {footerActions?.length && (
                    <Footer actions={footerActions} className="sticky bottom-0 z-10 shrink-0" />
                )}
            </div>
        </ThemeProvider>
    );
}
