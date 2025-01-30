"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";
import { Theme } from "@/lib/ui";

export interface ThemeProviderProps {
    theme?: Theme;
    doNotPersistTheme?: boolean;
    children: ReactNode;
}

/**
 * Applies a theme to the app.
 *
 * @param theme Explicitly desired theme, if available. If this is not provided, local storage will be used, with a
 * fallback value of "system" if the local value is missing as well.
 * @param doNotPersistTheme If true, the provided theme will not be persisted in local storage (e.g., if it is only
 * intended as a "forced" theme for a specific page, rather than a true theme choice).
 * @param children Child component.
 */
export function ThemeProvider({ theme, doNotPersistTheme, children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute={"class"}
            defaultTheme={"system"}
            forcedTheme={theme ?? undefined}
            enableSystem
            disableTransitionOnChange
        >
            {!doNotPersistTheme && <ThemeSetter theme={theme} />}
            {children}
        </NextThemesProvider>
    );
}

interface ThemeSetterProps {
    theme?: string;
}

/**
 * Component that does not render anything and only stores the given theme in local storage if it is defined. As a
 * result, the locally stored theme value can be used as a reasonable fallback while the real value is loading from
 * the database.
 *
 * It needs to be separate from the theme provider because it relies on the useTheme hook, which only works properly
 * inside the context of the provider component from next-themes (aliased here as NextThemesProvider).
 *
 * @param theme Theme to store in the local storage.
 */
function ThemeSetter({ theme }: ThemeSetterProps) {
    const { setTheme } = useTheme();
    useEffect(() => {
        if (theme) setTheme(theme);
    }, [setTheme, theme]);
    return null;
}
