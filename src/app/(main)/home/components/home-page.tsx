"use client";

import { FooterActionData, PageTemplate } from "@/components/ui/page/template/page-template";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";
import { DeckListCard } from "@/app/(main)/home/components/deck-list-card";
import { CardsRemaining, DeckPreview } from "@/server/data/services/deck";
import { SelectUser } from "@/server/data/services/user";
import { FolderPlus, Search, SquarePlus } from "lucide-react";
import { useState } from "react";
import { DeckForm } from "@/components/ui/modal/deck-form";
import { useRouter } from "next/navigation";
import { ModifyCardData, ModifyDeckData } from "@/lib/validation-schemas";
import { createNewDeck } from "@/server/actions/deck";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { CardForm } from "@/components/ui/modal/card-form";
import { createNewCard } from "@/server/actions/card";
import { SelectOption } from "@/lib/ui";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/ui/modal/controlled-modal-collection";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";

export interface HomePageProps {
    user: SelectUser;
    summary: CardsRemaining;
    decks: DeckPreview[];
}

export function HomePage({ user, summary, decks }: HomePageProps) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null); // null value means that no modal is open
    const router = useRouter();

    async function onNewDeckSubmit(data: ModifyDeckData) {
        await createNewDeck(data);
        setCurrentModalIndex(null);
        router.refresh();
    }

    async function onNewCardSubmit(data: ModifyCardData) {
        await createNewCard(data);
        setCurrentModalIndex(null);
        router.refresh();
    }

    const deckOptions: SelectOption[] = decks.map(({ deck }) => ({
        label: deck.name,
        value: deck.id,
    }));

    const modals: ModalData[] = [
        {
            title: "New deck",
            description: "Create a new deck.",
            children: (
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onNewDeckSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                />
            ),
        },
        {
            title: "New card",
            description: "Create a new card.",
            children: (
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onNewCardSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deckOptions={deckOptions}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: FolderPlus,
            text: "New deck",
            action: () => setCurrentModalIndex(0), // Index of the deck modal (first in the array)
        },
        {
            Icon: SquarePlus,
            text: "New card",
            action: () => setCurrentModalIndex(1), // Index of the card modal (second in the array)
        },
        { Icon: Search, text: "Browse", action: "/browse" },
    ];

    return (
        <PageTemplate
            title={"Your garden"}
            user={user}
            hideHomeButton
            footerActions={footerActions}
        >
            <ContentWrapper>
                <RemainingCardsGrid remaining={summary} className={"p-3"} />
                {decks.map((preview) => (
                    <DeckListCard preview={preview} key={preview.deck.id} />
                ))}
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
