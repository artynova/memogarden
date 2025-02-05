import { DeckPreview } from "@/server/data/services/deck";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";
import { Button } from "@/components/ui/base/button";
import { Check, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";
import { LimitedTextSpan } from "@/components/ui/limited-text-span";
import { DeckHealthBar } from "@/components/ui/resource-state/deck-health-bar";

const MAX_DECK_NAME_LENGTH = 30;
const MAX_DECK_NAME_LENGTH_MOBILE = 15;

export interface DeckListCardProps {
    preview: DeckPreview;
}

export function DeckListCard({ preview }: DeckListCardProps) {
    const { deck, remaining } = preview;
    const revisionCleared =
        remaining.new === 0 && remaining.learning === 0 && remaining.review === 0;
    return (
        <Card className={"flex justify-between overflow-hidden"}>
            <Link href={`/deck/${deck.id}`} className={"block grow"}>
                <CardHeader>
                    <h2 className={"text-center font-bold"}>
                        <LimitedTextSpan
                            text={deck.name}
                            maxLength={MAX_DECK_NAME_LENGTH}
                            maxLengthMobile={MAX_DECK_NAME_LENGTH_MOBILE}
                        />
                    </h2>
                </CardHeader>
                <CardContent className={"space-y-4"}>
                    <RemainingCardsGrid remaining={remaining} />
                    <DeckHealthBar retrievability={deck.retrievability} withBarText />
                </CardContent>
            </Link>
            <Button
                asChild
                disabled={revisionCleared}
                aria-disabled={revisionCleared}
                className={
                    "h-auto w-20 shrink-0 rounded-l-none sm:w-32 [&_svg]:size-14 sm:[&_svg]:size-14"
                }
            >
                {revisionCleared ? (
                    <button>
                        <span className={"sr-only"}>Revision cleared</span>
                        <Check aria-label={"Revision cleared icon"} />
                    </button>
                ) : (
                    <Link href={`/deck/${deck.id}/revise`}>
                        <span className={"sr-only"}>Revise</span>
                        <ChevronsRight aria-label={"Revise icon"} />
                    </Link>
                )}
            </Button>
        </Card>
    );
}
