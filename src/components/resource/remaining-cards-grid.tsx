import { CardsRemaining } from "@/server/data/services/deck";
import { Fragment } from "react";

import { cn } from "@/lib/ui/generic";
import { textUnimportantClass } from "@/lib/ui/tailwind";

function getDeckRemainingRenderData(remaining: CardsRemaining) {
    return [
        {
            name: "Seeds",
            number: remaining.new,
            textColorClass: remaining.new ? "" : textUnimportantClass,
        },
        {
            name: "Sprouts",
            number: remaining.learning,
            textColorClass: remaining.learning ? "" : textUnimportantClass,
        },
        {
            name: "Growing",
            number: remaining.review,
            textColorClass: remaining.review ? "" : textUnimportantClass,
        },
    ];
}

/**
 * Grid displaying information about how many cards of different types are remaining in some context.
 *
 * @param props Component properties.
 * @param props.remaining Remaining cards data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function RemainingCardsGrid({
    remaining,
    className,
}: {
    remaining: CardsRemaining;
    className?: string;
}) {
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
                    <span className="font-bold sm:text-center">{data.name}</span>
                    <span className={cn(data.textColorClass, "text-right sm:text-center")}>
                        {data.number}
                    </span>
                </Fragment>
            ))}
        </div>
    );
}
