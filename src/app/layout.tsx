import "@/app/globals.css";
import React, { ReactNode } from "react";

/**
 * General app page metadata.
 */
export const metadata = {
    title: "MemoGarden",
    description: "Gamified flashcard revision app themed around gardening",
};

/**
 * Root layout of all pages (both static and user-specific).
 *
 * @param props Component properties.
 * @param props.children Content.
 * @returns The component.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
