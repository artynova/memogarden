import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/page/static/header";
import { Footer } from "@/components/page/static/footer";
import { ReactNode } from "react";
import { cn } from "@/lib/ui/generic";

/**
 * Common layout of static pages.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @param props.children Content.
 * @returns The component.
 */
export function PageTemplate({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <ThemeProvider theme="system" doNotPersistTheme>
            <div className={cn("flex min-h-screen flex-col justify-between gap-6", className)}>
                <Header />
                <main>{children}</main>
                <Footer className="pt-12" />
            </div>
        </ThemeProvider>
    );
}
