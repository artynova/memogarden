"use client";

import { FooterActionData } from "@/components/page/main/template/footer";
import { Folder, Pencil, Trash } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { PageTemplate } from "@/components/page/main/template/page-template";
import { useRouter } from "next/navigation";
import { SelectUser } from "@/server/data/services/user";
import { useState } from "react";
import { ModifyCardData } from "@/server/actions/card/schemas";
import { deleteCard, updateCard } from "@/server/actions/card/actions";
import { CardForm } from "@/components/resource/card-form";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/modal/controlled-modal-collection";
import { SelectCardDataView } from "@/server/data/services/card";
import { MaturityBar } from "@/components/resource/bars/maturity-bar";
import { getCardMaturity } from "@/lib/ui/maturity";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { CardHealthBarWithLabel } from "@/components/resource/bars/card-health-bar-with-label";
import { CardCard } from "@/components/resource/card-card";
import { ConfirmationPrompt } from "@/components/confirmation-prompt";
import { SelectOption } from "@/lib/utils/input";
import removeMd from "remove-markdown";

/**
 * Client part of the individual card page.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.card Card data.
 * @param props.deckOptions Options for the card deck selection field.
 * @returns The component.
 */
export function CardPage({
    user,
    card,
    deckOptions,
}: {
    user: SelectUser;
    card: SelectCardDataView;
    deckOptions: SelectOption[];
}) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null); // null value means that no modal is open
    const router = useRouter();

    async function onEditSubmit(data: ModifyCardData) {
        await updateCard(data, card.id);
        setCurrentModalIndex(null);
        router.refresh();
    }

    async function onCardDelete() {
        await deleteCard(card.id);
        router.push(`/deck/${card.deckId}`);
    }

    const modals: ModalData[] = [
        {
            title: "Edit the card",
            description: "Change the card's content.",
            children: (
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onEditSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deckOptions={deckOptions}
                    card={card}
                />
            ),
        },
        {
            title: "Delete the card?",
            description:
                "You cannot undo card deletion. Your past revisions of this card will still contribute to account statistics.",
            children: (
                <ConfirmationPrompt
                    onConfirm={ignoreAsyncFnResult(onCardDelete)}
                    onCancel={() => setCurrentModalIndex(null)}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: Pencil,
            text: "Edit card",
            action: () => setCurrentModalIndex(0),
        },
        {
            Icon: Folder,
            text: "See deck",
            action: `/deck/${card.deckId}`,
        },
        {
            Icon: Trash,
            text: "Delete card",
            action: () => setCurrentModalIndex(1),
        },
    ];

    return (
        <PageTemplate title={removeMd(card.front)} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <CardHealthBarWithLabel
                    retrievability={card.retrievability}
                    due={card.due}
                    timezone={user.timezone}
                    withBarText
                />
                <MaturityBar currentMaturity={getCardMaturity(card.stateId, card.scheduledDays)} />
                <CardCard card={card} />
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
