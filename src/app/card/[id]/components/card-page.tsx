"use client";

import { FooterActionData } from "@/components/ui/page/footer";
import { Folder, Pencil, Trash } from "lucide-react";
import { getTrimmedText, ignoreAsyncFnResult } from "@/lib/utils";
import { HOME } from "@/lib/routes";
import { PageTemplate } from "@/components/ui/page/page-template";
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
import removeMd from "remove-markdown";
import { MaturityBar } from "@/components/ui/resource-state/maturity-bar";
import { getCardMaturity } from "@/lib/spaced-repetition";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";
import Markdown from "react-markdown";
import { Separator } from "@/components/ui/base/separator";
import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { DateTime } from "luxon";

export interface CardPageProps {
    user: SelectUser;
    card: SelectCardDataView;
    deckOptions: SelectOption[];
}

function getDateString(date: Date): string {
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_SHORT);
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
        router.push(HOME);
    }

    const modals: ModalData[] = [
        {
            title: "Edit Card",
            description: "Edit the card.",
            children: (
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onEditSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deckOptions={deckOptions}
                    card={card}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: Pencil,
            text: "Edit Card",
            action: () => setCurrentModalIndex(0),
        },
        {
            Icon: Folder,
            text: "See Deck",
            action: `/deck/${card.deckId}`,
        },
        {
            Icon: Trash,
            text: "Delete Card",
            action: ignoreAsyncFnResult(onCardDelete),
        },
    ];

    return (
        <PageTemplate title={card.front} user={user} footerActions={footerActions}>
            <div
                className={
                    "mx-auto flex h-full max-w-screen-sm flex-col items-stretch justify-center space-y-6 p-6"
                }
            >
                <span className={"text-center"}>{`Due: ${getDateString(card.due)}`}</span>
                <HealthBar retrievability={card.retrievability} withText />
                <MaturityBar currentMaturity={getCardMaturity(card.stateId, card.scheduledDays)} />
                <Card>
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>{"Front:"}</h2>
                    </CardHeader>
                    <CardContent>
                        <Markdown>{card.front}</Markdown>
                    </CardContent>
                    <Separator />
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>{"Back:"}</h2>
                    </CardHeader>
                    <CardContent>
                        <Markdown>{card.back}</Markdown>
                    </CardContent>
                </Card>
            </div>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
