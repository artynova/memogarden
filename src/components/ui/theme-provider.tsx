"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export interface ThemeProviderProps {
    theme: string;
    children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute={"class"}
            forcedTheme={theme}
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}
