import React from "react";
import { cardMaturities, CardMaturity } from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";

export interface MaturityBarProps {
    currentMaturity: CardMaturity;
}

/**
 * Maturity bar for a card, displayed on a line with dots representing states. Each dot has a label and an SVG
 * icon. The current state is highlighted through yellow coloring and increased size.
 *
 * @param currentMaturity The index of the current maturity state from left to right.
 */
export function MaturityBar({ currentMaturity }: MaturityBarProps) {
    return (
        <div className={"py-12"}>
            <div className="relative flex w-full items-center justify-between">
                <div className="absolute h-1 w-full bg-muted" />
                {cardMaturities.map((maturity, index) => (
                    <div key={index} className="flex grow flex-col items-center">
                        <div
                            className={cn(
                                "flex size-8 items-center justify-center rounded-full transition-all",
                                (index as CardMaturity) === currentMaturity
                                    ? "scale-125 bg-accent hover:scale-[1.4]"
                                    : "scale-100 bg-muted hover:scale-110",
                            )}
                        >
                            <div
                                className={cn(
                                    "size-5 rounded-full border-4 border-muted-foreground bg-transparent transition-all",
                                    (index as CardMaturity) === currentMaturity
                                        ? "border-accent-foreground"
                                        : "border-foreground",
                                )}
                            />
                            <div className={"absolute top-[-85%]"}>
                                <maturity.icon
                                    className={`size-6 transition-colors ${
                                        (index as CardMaturity) === currentMaturity
                                            ? "text-accent"
                                            : "text-muted"
                                    }`}
                                    aria-label={`${maturity.name} icon`}
                                />
                            </div>
                            <div className={"absolute -bottom-3/4 text-sm"}>{maturity.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
