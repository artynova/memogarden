"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";

import { Theme } from "@/lib/ui/theme";

/**
 * Theme provider for the app.
 *
 * @param props Component properties.
 * @param props.theme Explicitly requested theme, if available. By default, if provided, this theme will also be stored
 * in local storage to allow using that as a fallback in the future. If not provided, local storage value will be used,
 * with a default value of "system" if the local value is missing as well.
 * @param props.doNotPersistTheme Whether to bypass the default behavior of storing the explicit theme in local storage,
 * for cases when the theme is a "forced" theme for a specific route rather than an app-wide theme choice.
 * @param props.children Content.
 * @returns The component.
 */
export function ThemeProvider({
    theme,
    doNotPersistTheme,
    children,
}: {
    theme?: Theme;
    doNotPersistTheme?: boolean;
    children: ReactNode;
}) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            forcedTheme={theme}
            enableSystem
            disableTransitionOnChange
        >
            {!doNotPersistTheme && <ThemeStorageHandler theme={theme} />}
            {children}
        </NextThemesProvider>
    );
}

/**
 * Component that does not render anything and only stores the given theme in local storage if the theme is defined. As a
 * result, the locally stored theme value can be used as a reasonable fallback while the real value is loading from
 * the database.
 *
 * It needs to be separate from the theme provider because it relies on the useTheme hook, which only works properly
 * inside the context of the provider component from next-themes (aliased here as NextThemesProvider).
 *
 * @param props Component properties.
 * @param props.theme Theme to store in the local storage. If `null`, nothing will be stored.
 * @returns The component.
 */
function ThemeStorageHandler({ theme }: { theme?: Theme }) {
    const { setTheme } = useTheme();
    useEffect(() => {
        if (theme) setTheme(theme);
    }, [setTheme, theme]);
    return null;
}
