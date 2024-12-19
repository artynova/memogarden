"use client";

import { useRef } from "react";
import { EditDeckForm, EditDeckFormHandle } from "@/app/deck/[id]/edit/components/edit-deck-form";
import { FooterActionData } from "@/components/ui/page/footer";
import { Check, Trash, X } from "lucide-react";
import { PageTemplate } from "@/components/ui/page/page-template";
import { SelectUser } from "@/server/data/services/user";
import { HOME } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/base/card";
import { SelectDeck } from "@/server/data/services/deck";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { deleteDeck } from "@/server/actions/deck";
import { useRouter } from "next/navigation";

export interface EditDeckPageProps {
    user: SelectUser;
    deck: SelectDeck;
}

// The main reason why this code is not in page.tsx directly is that it needs a client component and the base page itself cannot be one, so this intermediate component is used instead
export function EditDeckPage({ user, deck }: EditDeckPageProps) {
    const formRef = useRef<EditDeckFormHandle>(null);
    const router = useRouter();

    const footerActions: FooterActionData[] = [
        { Icon: Check, text: "Save Deck", action: () => formRef.current?.submit() },
        { Icon: X, text: "Discard Deck", action: `/deck/${deck.id}` },
        {
            Icon: Trash,
            text: "Delete Deck",
            action: ignoreAsyncFnResult(async () => {
                await deleteDeck(deck.id);
                router.push(HOME);
            }),
        },
    ];

    return (
        <PageTemplate title={deck.name} user={user} footerActions={footerActions}>
            <div
                className={
                    "mx-auto flex h-full max-w-screen-lg flex-col items-stretch justify-center space-y-6 p-6"
                }
            >
                <Card className={"p-6"}>
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>Edit Deck</h2>
                        <CardDescription>
                            {"Update the deck's name or delete the deck"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditDeckForm deck={deck} ref={formRef} />
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
