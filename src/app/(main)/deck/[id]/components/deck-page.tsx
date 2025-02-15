"use client";

import { FooterActionData } from "@/components/page/template/footer";
import { Check, ChevronsRight, Pencil, SquarePlus, SquareStack, Trash } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { deleteDeck, updateDeck } from "@/server/actions/deck/actions";
import { HOME } from "@/lib/routes";
import { PageTemplate } from "@/components/page/template/page-template";
import { RemainingCardsGrid } from "@/components/resource/remaining-cards-grid";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { DeckPreview } from "@/server/data/services/deck";
import { useRouter } from "next/navigation";
import { SelectUser } from "@/server/data/services/user";
import { useState } from "react";
import { DeckForm } from "@/components/resource/deck-form";
import { ModifyCardData } from "@/server/actions/card/schemas";
import { createNewCard } from "@/server/actions/card/actions";
import { CardForm } from "@/components/resource/card-form";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/modal/controlled-modal-collection";
import { DeckHealthBarWithLabel } from "@/components/resource/bars/deck-health-bar-with-label";
import { ConfirmationPrompt } from "@/components/confirmation-prompt";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { ModifyDeckData } from "@/server/actions/deck/schemas";

import { SelectOption } from "@/lib/utils/input";

/**
 * Client part of the individual deck page.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.preview Deck preview data.
 * @param props.deckOptions Options for the card deck selection field (when opening the card creation modal from this
 * page).
 * @returns The component.
 */
export function DeckPage({
    user,
    preview,
    deckOptions,
}: {
    user: SelectUser;
    preview: DeckPreview;
    deckOptions: SelectOption[];
}) {
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
            <ContentWrapper variant="compact">
                <RemainingCardsGrid remaining={remaining} className="px-6" />
                <DeckHealthBarWithLabel retrievability={deck.retrievability} withBarText />
                <Button
                    asChild
                    disabled={revisionCleared}
                    className="flex h-24 w-full items-center justify-center space-x-2 rounded-3xl text-xl [&_svg]:size-10"
                >
                    {revisionCleared ? (
                        <button>
                            <span className="font-bold">Revision cleared</span>
                            <Check aria-label="Revision cleared icon" />
                        </button>
                    ) : (
                        <Link href={`/deck/${encodeURIComponent(deck.id)}/review`}>
                            <span className="font-bold">Review</span>
                            <ChevronsRight aria-label="Review icon" />
                        </Link>
                    )}
                </Button>
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
