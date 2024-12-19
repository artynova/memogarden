"use client";

import { useRef } from "react";
import { NewDeckForm, NewDeckFormHandle } from "@/app/deck/new/components/new-deck-form";
import { FooterActionData } from "@/components/ui/page/footer";
import { Check, X } from "lucide-react";
import { PageTemplate } from "@/components/ui/page/page-template";
import { SelectUser } from "@/server/data/services/user";
import { HOME } from "@/lib/routes";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/base/card";

export interface NewDeckPageProps {
    user: SelectUser;
}

// The main reason why this code is not in page.tsx directly is that it needs a client component and the base page itself cannot be one, so this intermediate component is used instead
export function NewDeckPage({ user }: NewDeckPageProps) {
    const formRef = useRef<NewDeckFormHandle>(null);

    const footerActions: FooterActionData[] = [
        { Icon: Check, text: "Save Deck", action: () => formRef.current?.submit() },
        { Icon: X, text: "Discard Deck", action: HOME },
    ];

    return (
        <PageTemplate title={"New Deck"} user={user} footerActions={footerActions}>
            <div
                className={
                    "mx-auto flex h-full max-w-screen-lg flex-col items-stretch justify-center space-y-6 p-6"
                }
            >
                <Card className={"p-6"}>
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>Create Deck</h2>
                        <CardDescription>Create a new deck with a specified name</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NewDeckForm ref={formRef} />
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
