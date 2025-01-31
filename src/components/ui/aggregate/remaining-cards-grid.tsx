import { CardsRemaining } from "@/server/data/services/deck";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface RemainingCardsForType {
    name: string;
    number: number;
    textColorClass: string;
}

function getDeckRemainingRenderData(remaining: CardsRemaining): RemainingCardsForType[] {
    return [
        {
            name: "Seeds",
            number: remaining.new,
            textColorClass: remaining.new ? "" : "text-muted-foreground",
        },
        {
            name: "Sprouts",
            number: remaining.learning,
            textColorClass: remaining.learning ? "" : "text-muted-foreground",
        },
        {
            name: "Growing",
            number: remaining.review,
            textColorClass: remaining.review ? "" : "text-muted-foreground",
        },
    ];
}

export interface RemainingCardsGridProps {
    remaining: CardsRemaining;
    className?: string;
}

export function RemainingCardsGrid({ remaining, className }: RemainingCardsGridProps) {
    const remainingArray = getDeckRemainingRenderData(remaining);
    return (
        <div
            className={cn(
                "grid grid-cols-2 grid-rows-3 gap-2 sm:grid-flow-col sm:grid-cols-3 sm:grid-rows-2 sm:gap-x-6",
                className,
            )}
        >
            {remainingArray.map((data) => (
                <Fragment key={data.name}>
                    <span className={"font-bold sm:text-center"}>{data.name}</span>
                    <span className={cn(data.textColorClass, "text-right sm:text-center")}>
                        {data.number}
                    </span>
                </Fragment>
            ))}
        </div>
    );
}
