import { DeckPreview } from "@/server/data/services/deck";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";
import { Button } from "@/components/ui/base/button";
import { Check, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { RemainingCardsGrid } from "@/components/ui/aggregate/remaining-cards-grid";

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
                    <h2 className={"text-center font-bold"}>{deck.name}</h2>
                </CardHeader>
                <CardContent>
                    <RemainingCardsGrid remaining={remaining} />
                </CardContent>
            </Link>
            <Button
                asChild
                disabled={revisionCleared}
                aria-disabled={revisionCleared}
                className={
                    "h-auto w-20 shrink-0 rounded-l-none sm:w-32 [&_svg]:size-16 md:[&_svg]:size-20"
                }
            >
                <button>
                    <Link href={`/deck/${deck.id}/revise`}>
                        {revisionCleared ? <Check /> : <ChevronsRight />}
                    </Link>
                </button>
            </Button>
        </Card>
    );
}
