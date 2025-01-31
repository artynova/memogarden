"use client";

import { FooterActionData } from "@/components/ui/page/template/footer";
import { Folder, Pencil, Trash } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { PageTemplate } from "@/components/ui/page/template/page-template";
import { useRouter } from "next/navigation";
import { SelectUser } from "@/server/data/services/user";
import { useState } from "react";
import { ModifyCardData } from "@/lib/validation-schemas";
import { deleteCard, updateCard } from "@/server/actions/card";
import { CardForm } from "@/components/ui/modal/card-form";
import { SelectOption } from "@/lib/ui";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/ui/modal/controlled-modal-collection";
import { SelectCardDataView } from "@/server/data/services/card";
import { MaturityBar } from "@/components/ui/resource-state/maturity-bar";
import { getCardMaturity } from "@/lib/spaced-repetition";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { CardHealthBar } from "@/components/ui/resource-state/card-health-bar";
import { CardCard } from "@/components/ui/card-card";
import { ConfirmationPrompt } from "@/components/ui/modal/confirmation-prompt";

export interface CardPageProps {
    user: SelectUser;
    card: SelectCardDataView;
    deckOptions: SelectOption[];
}

export function CardPage({ user, card, deckOptions }: CardPageProps) {
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
        <PageTemplate title={card.front} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <CardHealthBar
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
