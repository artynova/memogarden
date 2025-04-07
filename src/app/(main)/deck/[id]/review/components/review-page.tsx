"use client";

import { SelectCard } from "@/server/data/services/card";
import { FooterActionData, PageTemplate } from "@/components/page/main/template/page-template";
import { SelectUser } from "@/server/data/services/user";
import { ChangeEvent, useState } from "react";
import { Check, Frown, Laugh, Meh, Smile } from "lucide-react";
import { reviewCardWithRating } from "@/server/actions/card/actions";
import { getCardMaturity } from "@/lib/ui/maturity";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { Textarea } from "@/components/shadcn/textarea";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import { CardCard } from "@/components/resource/card-card";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { MaturityBar } from "@/components/resource/bars/maturity-bar";

import { ReviewRating } from "@/lib/enums";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";

/**
 * Client part of the deck review page.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.card Card data.
 * @returns The component.
 */
export function ReviewPage({ user, card }: { user: SelectUser; card: SelectCard }) {
    const [answer, setAnswer] = useState<string | null>(null);

    return answer === null ? (
        <ReviewPagePreAnswer onAnswerSubmit={setAnswer} user={user} card={card} />
    ) : (
        <ReviewPagePostAnswer
            answer={answer}
            user={user}
            card={card}
            onSubmit={() => setAnswer(null)}
        />
    );
}

/**
 * Version of the review page that is shown before the user answers the card's question and starts self-evaluation.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.card Card data.
 * @param props.onAnswerSubmit Answer submission callback (executed when the user presses the button to finalize their
 * answer and check the real answer on the card's back).
 * @returns The component.
 */
function ReviewPagePreAnswer({
    user,
    card,
    onAnswerSubmit,
}: {
    user: SelectUser;
    card: SelectCard;
    onAnswerSubmit: (answer: string) => void;
}) {
    const [answer, setAnswer] = useState<string>("");

    const footerActions: FooterActionData[] = [
        {
            Icon: Check,
            text: "See answer",
            action: () => onAnswerSubmit(answer),
        },
    ];

    return (
        <PageTemplate title={`Review ${card.deckName}`} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <CardCard card={card} onlyFront />
                <Textarea
                    placeholder="Input your answer to self-check later (optional)"
                    defaultValue={answer}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                />
                <HealthBar retrievability={card.retrievability} />
            </ContentWrapper>
        </PageTemplate>
    );
}

/**
 * Version of the review page that is shown after the user answers the card's question and starts self-evaluation.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.card Card data.
 * @param props.answer Answer submitted in the previous stage.
 * @param props.onSubmit Rating submission callback (does not expose the submitted rating, only allows code to be
 * executed at that point). Intended for cleanup purposes.
 * @returns The component.
 */
function ReviewPagePostAnswer({
    user,
    card,
    answer,
    onSubmit,
}: {
    user: SelectUser;
    card: SelectCard;
    answer: string;
    onSubmit: () => void;
}) {
    const router = useRouter();

    async function onRatingSubmit(rating: ReviewRating) {
        await reviewCardWithRating(card.id, answer, rating);
        onSubmit();
        router.refresh();
    }

    const footerActions: FooterActionData[] = [
        {
            Icon: Frown,
            text: "Again",
            action: ignoreAsyncFnResult(() => onRatingSubmit(ReviewRating.Again)),
        },
        {
            Icon: Meh,
            text: "Hard",
            action: ignoreAsyncFnResult(() => onRatingSubmit(ReviewRating.Hard)),
        },
        {
            Icon: Smile,
            text: "Good",
            action: ignoreAsyncFnResult(() => onRatingSubmit(ReviewRating.Good)),
        },
        {
            Icon: Laugh,
            text: "Easy",
            action: ignoreAsyncFnResult(() => onRatingSubmit(ReviewRating.Easy)),
        },
    ];

    return (
        <PageTemplate title={`Review ${card.deckName}`} user={user} footerActions={footerActions}>
            <ContentWrapper>
                <Card>
                    <CardHeader>
                        <h2 className="text-center font-bold">Your answer:</h2>
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
