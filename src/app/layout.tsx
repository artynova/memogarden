import "@/app/globals.css";
import React, { ReactNode } from "react";

export const metadata = {
    title: "MemoGarden",
    description: "Gamified flashcard revision app themed around gardening",
};

export interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
