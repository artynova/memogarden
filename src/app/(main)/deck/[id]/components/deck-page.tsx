"use client";

import { FooterActionData } from "@/components/ui/page/template/footer";
import { Check, ChevronsRight, Pencil, SquarePlus, SquareStack, Trash } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { deleteDeck, updateDeck } from "@/server/actions/deck";
import { HOME } from "@/lib/routes";
import { PageTemplate } from "@/components/ui/page/template/page-template";
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
import { DeckHealthBar } from "@/components/ui/resource-state/deck-health-bar";
import { ConfirmationPrompt } from "@/components/ui/modal/confirmation-prompt";

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
            title: "Edit the deck",
            description: "Change the deck's name.",
            children: (
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onEditSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deck={deck}
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
                    card={{ deckId: deck.id }}
                />
            ),
        },
        {
            title: "Delete the deck?",
            description:
                "You cannot undo deck deletion. All cards in the deck will be deleted as well.",
            children: (
                <ConfirmationPrompt
                    onConfirm={ignoreAsyncFnResult(onDeckDelete)}
                    onCancel={() => setCurrentModalIndex(null)}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: Pencil,
            text: "Edit deck",
            action: () => setCurrentModalIndex(0),
        },
        {
            Icon: SquarePlus,
            text: "New card",
            action: () => setCurrentModalIndex(1),
        },
        {
            Icon: Trash,
            text: "Delete deck",
            action: () => setCurrentModalIndex(2),
        },
        {
            Icon: SquareStack,
            text: "Browse deck cards",
            action: `/browse?deckId=${encodeURIComponent(deck.id)}`,
        },
    ];

    const revisionCleared =
        remaining.new === 0 && remaining.learning === 0 && remaining.review === 0;

    return (
        <PageTemplate title={deck.name} user={user} footerActions={footerActions}>
            <div
                className={
                    "mx-auto flex h-full max-w-screen-sm flex-col items-stretch justify-center gap-y-6 p-6"
                }
            >
                <RemainingCardsGrid remaining={remaining} className={"px-6"} />
                <DeckHealthBar retrievability={deck.retrievability} withBarText />
                <Button
                    asChild
                    disabled={revisionCleared}
                    className={
                        "flex h-24 w-full items-center justify-center space-x-2 rounded-3xl text-xl [&_svg]:size-10"
                    }
                >
                    {revisionCleared ? (
                        <button>
                            <span className={"font-bold"}>Revision cleared</span>
                            <Check aria-label={"Revision cleared icon"} />
                        </button>
                    ) : (
                        <Link href={`/deck/${encodeURIComponent(deck.id)}/revise`}>
                            <span className={"font-bold"}>Revise</span>
                            <ChevronsRight aria-label={"Revise icon"} />
                        </Link>
                    )}
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
