export const metadata = {
    title: "MemoGarden",
    description: "Gamified flashcard revision app themed around gardening",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}
