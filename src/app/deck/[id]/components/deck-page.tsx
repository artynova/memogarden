"use client";

import { FooterActionData } from "@/components/ui/page/footer";
import { Check, ChevronsRight, Pencil, SquarePlus, SquareStack, Trash } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { deleteDeck, updateDeck } from "@/server/actions/deck";
import { HOME } from "@/lib/routes";
import { PageTemplate } from "@/components/ui/page/page-template";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";
import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { DeckPreview } from "@/server/data/services/deck";
import { useRouter } from "next/navigation";
import { SelectUser } from "@/server/data/services/user";
import { useState } from "react";
import { DeckForm } from "@/components/ui/modal/deck-form";
import { ModifyCardData, ModifyDeckData } from "@/lib/validation-schemas";
import { createNewCard } from "@/server/actions/card";
import { CardForm } from "@/components/ui/modal/card-form";
import { SelectOption } from "@/lib/ui";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/ui/modal/controlled-modal-collection";

export interface DeckPageProps {
    user: SelectUser;
    preview: DeckPreview;
    deckOptions: SelectOption[];
}

export function DeckPage({ user, preview, deckOptions }: DeckPageProps) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null); // null value means that no modal is open
    const router = useRouter();

    const { deck, remaining } = preview;

    async function onEditSubmit(data: ModifyDeckData) {
        await updateDeck(data, deck.id);
        setCurrentModalIndex(null);
        router.refresh();
    }

    async function onNewCardSubmit(data: ModifyCardData) {
        await createNewCard(data);
        setCurrentModalIndex(null);
        router.refresh();
    }

    async function onDeckDelete() {
        await deleteDeck(deck.id);
        router.push(HOME);
    }

    const modals: ModalData[] = [
        {
            title: "Edit Deck",
            description: "Edit the deck.",
            children: (
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onEditSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deck={deck}
                />
            ),
        },
        {
            title: "New Card",
            description: "Create a new card.",
            children: (
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onNewCardSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deckOptions={deckOptions}
                    card={{ deckId: deck.id }}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: Pencil,
            text: "Edit Deck",
            action: () => setCurrentModalIndex(0),
        },
        {
            Icon: SquarePlus,
            text: "New Card",
            action: () => setCurrentModalIndex(1),
        },
        {
            Icon: Trash,
            text: "Delete Deck",
            action: ignoreAsyncFnResult(onDeckDelete),
        },
        {
            Icon: SquareStack,
            text: "Browse Deck Cards",
            action: `/browse?deckId=${encodeURIComponent(deck.id)}`,
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
                <RemainingCardsGrid remaining={remaining} className={"p-6"} />
                <Button
                    asChild
                    disabled={revisionCleared}
                    className={"h-24 w-full rounded-3xl [&_svg]:size-10"}
                >
                    <button>
                        <Link
                            href={`/deck/${encodeURIComponent(deck.id)}/revise`}
                            className={"flex items-center space-x-2 text-xl"}
                        >
                            <span className={"font-bold"}>Revise</span>
                            {revisionCleared ? <Check /> : <ChevronsRight />}
                        </Link>
                    </button>
                </Button>
            </div>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
