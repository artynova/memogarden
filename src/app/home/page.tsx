import { FooterActionData, PageTemplate } from "@/components/ui/page/page-template";
import { FolderPlus, Search, SquarePlus } from "lucide-react";
import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { DeckListCard } from "@/app/home/components/deck-list-card";
import { getUserDataInProtectedRoute } from "@/lib/server-utils";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";

const footerActions: FooterActionData[] = [
    { Icon: FolderPlus, text: "New Deck", action: "/deck/new" },
    { Icon: SquarePlus, text: "New Card", action: "/card/new" },
    { Icon: Search, text: "Browse", action: "/browse" },
];

export default async function Page() {
    const user = await getUserDataInProtectedRoute();
    const now = new Date();
    const summary = await getAllRemaining(user.id, now);
    const decks = await getDecksPreview(user.id, now);

    return (
        <PageTemplate
            title={"Your Garden"}
            user={user}
            hideHomeButton
            footerActions={footerActions}
        >
            <div className={"mx-auto flex max-w-screen-lg flex-col gap-y-6 p-6"}>
                <RemainingCardsGrid remaining={summary} className={"p-3"} />
                {decks.map((preview) => (
                    <DeckListCard preview={preview} key={preview.deck.id} />
                ))}
            </div>
        </PageTemplate>
    );
}
