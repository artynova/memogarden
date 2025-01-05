"use client";

import { FooterActionData, PageTemplate } from "@/components/ui/page/page-template";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";
import { DeckListCard } from "@/app/home/components/deck-list-card";
import { CardsRemaining, DeckPreview } from "@/server/data/services/deck";
import { SelectUser } from "@/server/data/services/user";
import { FolderPlus, Search, SquarePlus } from "lucide-react";
import { useState } from "react";
import { ControlledActionModal } from "@/components/ui/modal/controlled-action-modal";
import { DeckForm } from "@/components/ui/modal/deck-form";
import { useRouter } from "next/navigation";
import { ModifyCardData, ModifyDeckData } from "@/lib/validation-schemas";
import { createNewDeck } from "@/server/actions/deck";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { CardForm } from "@/components/ui/modal/card-form";
import { createNewCard } from "@/server/actions/card";
import { SelectOption } from "@/lib/ui";

export interface HomePageProps {
    user: SelectUser;
    summary: CardsRemaining;
    decks: DeckPreview[];
}

export function HomePage({ user, summary, decks }: HomePageProps) {
    const [isNewDeckOpen, setNewDeckOpen] = useState(false);
    const [isNewCardOpen, setNewCardOpen] = useState(false);
    const router = useRouter();

    function onNewDeckClick() {
        setNewDeckOpen(isNewCardOpen ? isNewDeckOpen : true);
    }

    async function onNewDeckSubmit(data: ModifyDeckData) {
        await createNewDeck(data);
        setNewDeckOpen(false);
        router.refresh();
    }

    function onNewDeckCancel() {
        setNewDeckOpen(false);
    }

    function onNewCardClick() {
        setNewCardOpen(isNewDeckOpen ? isNewCardOpen : true);
    }

    async function onNewCardSubmit(data: ModifyCardData) {
        await createNewCard(data);
        setNewCardOpen(false);
        router.refresh();
    }

    function onNewCardCancel() {
        setNewCardOpen(false);
    }

    const deckOptions: SelectOption[] = decks.map(({ deck }) => ({
        label: deck.name,
        value: deck.id,
    }));

    const footerActions: FooterActionData[] = [
        {
            Icon: FolderPlus,
            text: "New Deck",
            action: onNewDeckClick,
        },
        {
            Icon: SquarePlus,
            text: "New Card",
            action: onNewCardClick,
        },
        { Icon: Search, text: "Browse", action: "/browse" },
    ];

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
            <ControlledActionModal
                open={isNewDeckOpen}
                onOpenChange={setNewDeckOpen}
                title={"New Deck"}
                description={"Create a new deck"}
            >
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onNewDeckSubmit)}
                    onCancel={onNewDeckCancel}
                />
            </ControlledActionModal>
            <ControlledActionModal
                open={isNewCardOpen}
                onOpenChange={setNewCardOpen}
                title={"New Card"}
                description={"Create a new card"}
            >
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onNewCardSubmit)}
                    onCancel={onNewCardCancel}
                    deckOptions={deckOptions}
                />
            </ControlledActionModal>
        </PageTemplate>
    );
}
