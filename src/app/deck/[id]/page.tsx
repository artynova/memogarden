import { FooterActionData, PageTemplate } from "@/components/ui/page/page-template";
import { notFound } from "next/navigation";
import { ChevronsRight, Pencil, SquarePlus, SquareStack } from "lucide-react";
import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/base/card";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";
import { getDeckPreview, isDeckAccessible } from "@/server/data/services/deck";
import { getUserDataInProtectedRoute } from "@/lib/server-utils";

export interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const user = await getUserDataInProtectedRoute();
    const accessible = await isDeckAccessible(user.id, params.id);
    if (!accessible) notFound(); // The deck is only accessible if it both exists and belongs to the user, i.e., an inaccessible deck may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const now = new Date();
    const preview = (await getDeckPreview(params.id, now))!; // The isDeckAccessible check also verifies that the deck exists and is non-deleted, and getDeckPreview only returns null for invalid deck IDs, so it is guaranteed to return non-null here
    const { deck, remaining } = preview;

    // The URLs in the action buttons are deck-specific and thus dynamic, so the footer actions need to be defined here, within the component function
    const footerActions: FooterActionData[] = [
        {
            Icon: SquarePlus,
            text: "New Card",
            action: `/card/new?deck=${encodeURIComponent(deck.id)}`,
        },
        { Icon: Pencil, text: "Edit Deck", action: `/deck/${encodeURIComponent(deck.id)}/edit` },

        {
            Icon: SquareStack,
            text: "Browse Deck Cards",
            action: `/browse?deck=${encodeURIComponent(deck.id)}`,
        },
    ];

    const revisionCleared =
        remaining.new === 0 && remaining.learning === 0 && remaining.review === 0;

    return (
        <PageTemplate title={deck.name} user={user} footerActions={footerActions}>
            <div
                className={
                    "mx-auto flex h-full max-w-screen-sm flex-col items-stretch justify-center space-y-6 p-6"
                }
            >
                <Card className={"overflow-hidden"}>
                    <CardHeader className={"p-9 pb-6"}>
                        <RemainingCardsGrid remaining={remaining} />
                    </CardHeader>
                    <Button
                        asChild
                        disabled={revisionCleared}
                        className={"h-24 w-full rounded-t-none [&_svg]:size-10"}
                    >
                        <button>
                            <Link
                                href={`/deck/${encodeURIComponent(deck.id)}/revise`}
                                className={"flex items-center space-x-2 text-xl"}
                            >
                                <span className={"font-bold"}>Revise</span>
                                <ChevronsRight />
                            </Link>
                        </button>
                    </Button>
                </Card>
            </div>
        </PageTemplate>
    );
}
