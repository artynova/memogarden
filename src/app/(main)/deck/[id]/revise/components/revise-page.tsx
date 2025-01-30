"use client";

import { SelectCard } from "@/server/data/services/card";
import { FooterActionData, PageTemplate } from "@/components/ui/page/template/page-template";
import { SelectUser } from "@/server/data/services/user";
import { ChangeEvent, useState } from "react";
import { Check, Frown, Laugh, Meh, Smile } from "lucide-react";
import { reviewCardWithRating } from "@/server/actions/card";
import { getCardMaturity, ReviewRating } from "@/lib/spaced-repetition";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { Textarea } from "@/components/ui/base/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";
import { CardCard } from "@/components/ui/card-card";
import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { MaturityBar } from "@/components/ui/resource-state/maturity-bar";

export interface RevisePageProps {
    user: SelectUser;
    card: SelectCard;
}

export function RevisePage({ user, card }: RevisePageProps) {
    const [answer, setAnswer] = useState<string | null>(null);

    return answer === null ? (
        <RevisePagePreAnswer onAnswerSubmit={setAnswer} user={user} card={card} />
    ) : (
        <RevisePagePostAnswer
            answer={answer}
            onSubmit={() => setAnswer(null)}
            user={user}
            card={card}
        />
    );
}

interface RevisePagePreAnswerProps extends RevisePageProps {
    onAnswerSubmit: (answer: string) => void;
}

/**
 * Version of the revision page that is shown before the user answers the card's question and starts self-evaluation.
 *
 * @param user User.
 * @param card Card data.
 * @param onAnswerSubmit Callback for when the user presses the button to fix their answer and show the card's back.
 */
function RevisePagePreAnswer({ user, card, onAnswerSubmit }: RevisePagePreAnswerProps) {
    const [answer, setAnswer] = useState<string>("");

    const footerActions: FooterActionData[] = [
        {
            Icon: Check,
            text: "New Deck",
            action: () => onAnswerSubmit(answer),
        },
    ];

    return (
        <PageTemplate title={`Revise ${card.deckName}`} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <CardCard card={card} onlyFront />
                <Textarea
                    placeholder={"Input your answer to self-check later (optional)"}
                    defaultValue={answer}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                />
            </ContentWrapper>
        </PageTemplate>
    );
}

interface RevisePagePostAnswerProps extends RevisePageProps {
    answer: string;
    onSubmit: () => void;
}

/**
 * Version of the revision page that is shown after the user answers the card's question and starts self-evaluation.
 *
 * @param user User.
 * @param card Card data.
 * @param answer Answer submitted in the pre-answer stage.
 * @param onSubmit Callback for when the user finishes self-evaluation.
 */
function RevisePagePostAnswer({ user, card, answer, onSubmit }: RevisePagePostAnswerProps) {
    const router = useRouter();

    async function onRatingSubmit(rating: ReviewRating) {
        await reviewCardWithRating(card.id, answer, rating);
        router.refresh();
        onSubmit();
    }

    const footerActions: FooterActionData[] = [
        {
            Icon: Frown,
            text: "Again",
            action: () => void onRatingSubmit(ReviewRating.Again),
        },
        {
            Icon: Meh,
            text: "Hard",
            action: () => void onRatingSubmit(ReviewRating.Hard),
        },
        {
            Icon: Smile,
            text: "Good",
            action: () => void onRatingSubmit(ReviewRating.Good),
        },
        {
            Icon: Laugh,
            text: "Easy",
            action: () => void onRatingSubmit(ReviewRating.Easy),
        },
    ];
    return (
        <PageTemplate title={`Revise ${card.deckName}`} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <Card>
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>Your answer:</h2>
                    </CardHeader>
                    <CardContent>{answer}</CardContent>
                </Card>
                <CardCard card={card} />
                <HealthBar retrievability={card.retrievability} />
                <MaturityBar currentMaturity={getCardMaturity(card.stateId, card.scheduledDays)} />
            </ContentWrapper>
        </PageTemplate>
    );
}
