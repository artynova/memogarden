import { DeckPreview } from "@/server/data/services/deck";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Check, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { RemainingCardsGrid } from "@/components/resource/remaining-cards-grid";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { DeckHealthBarWithLabel } from "@/components/resource/bars/deck-health-bar-with-label";

const MAX_DECK_NAME_LENGTH = 30;
const MAX_DECK_NAME_LENGTH_MOBILE = 15;

/**
 * Single deck card in the home page dashboard.
 *
 * @param props Component properties.
 * @param props.preview Deck preview data.
 * @returns The component.
 */
export function DeckListCard({ preview }: { preview: DeckPreview }) {
    const { deck, remaining } = preview;
    const revisionCleared =
        remaining.new === 0 && remaining.learning === 0 && remaining.review === 0;
    return (
        <Card className="flex justify-between overflow-hidden">
            <Link href={`/deck/${deck.id}`} className="block grow">
                <CardHeader>
                    <h2 className="text-center font-bold">
                        <LimitedTextSpan
                            text={deck.name}
                            maxLength={MAX_DECK_NAME_LENGTH}
                            maxLengthMobile={MAX_DECK_NAME_LENGTH_MOBILE}
                        />
                    </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RemainingCardsGrid remaining={remaining} />
                    <DeckHealthBarWithLabel retrievability={deck.retrievability} withBarText />
                </CardContent>
            </Link>
            <Button
                asChild
                disabled={revisionCleared}
                aria-disabled={revisionCleared}
                className="h-auto w-20 shrink-0 rounded-l-none sm:w-32 [&_svg]:size-14 sm:[&_svg]:size-14"
            >
                {revisionCleared ? (
                    <button>
                        <span className="sr-only">Revision cleared</span>
                        <Check aria-label="Revision cleared icon" />
                    </button>
                ) : (
                    <Link href={`/deck/${deck.id}/review`}>
                        <span className="sr-only">Review</span>
                        <ChevronsRight aria-label="Review icon" />
                    </Link>
                )}
            </Button>
        </Card>
    );
}
