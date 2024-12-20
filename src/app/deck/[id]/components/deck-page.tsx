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
import { ControlledActionModal } from "@/components/ui/modal/controlled-action-modal";
import { useState } from "react";
import { DeckForm } from "@/components/ui/modal/deck-form";
import { ModifyCardData, ModifyDeckData } from "@/lib/validation-schemas";
import { createNewCard } from "@/server/actions/card";
import { SelectOption } from "@/components/ui/form/select-with-label";
import { CardForm } from "@/components/ui/modal/card-form";

export interface DeckPageProps {
    user: SelectUser;
    preview: DeckPreview;
    deckOptions: SelectOption[];
}

export function DeckPage({ user, preview, deckOptions }: DeckPageProps) {
    const [isEditOpen, setEditOpen] = useState(false);
    const [isNewCardOpen, setNewCardOpen] = useState(false);
    const router = useRouter();

    const { deck, remaining } = preview;

    function onEditClick() {
        setEditOpen(isNewCardOpen ? isEditOpen : true);
    }

    async function onEditSubmit(data: ModifyDeckData) {
        await updateDeck(data, deck.id);
        setEditOpen(false);
        router.refresh();
    }

    function onEditCancel() {
        setEditOpen(false);
    }

    function onNewCardClick() {
        setNewCardOpen(isEditOpen ? isNewCardOpen : true);
    }

    async function onNewCardSubmit(data: ModifyCardData) {
        await createNewCard(data);
        setNewCardOpen(false);
        router.refresh();
    }

    function onNewCardCancel() {
        setNewCardOpen(false);
    }

    const footerActions: FooterActionData[] = [
        {
            Icon: SquarePlus,
            text: "New Card",
            action: onNewCardClick,
        },
        { Icon: Pencil, text: "Edit Deck", action: onEditClick },
        {
            Icon: Trash,
            text: "Delete Deck",
            action: ignoreAsyncFnResult(async () => {
                await deleteDeck(deck.id);
                router.push(HOME);
            }),
        },
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
            <ControlledActionModal
                open={isEditOpen}
                onOpenChange={setEditOpen}
                title={"Edit Deck"}
                description={"Edit the deck"}
            >
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onEditSubmit)}
                    onCancel={onEditCancel}
                    deck={deck}
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
                    card={{ deckId: deck.id }}
                />
            </ControlledActionModal>
        </PageTemplate>
    );
}
