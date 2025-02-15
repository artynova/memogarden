import React from "react";
import { cardMaturities } from "@/lib/ui/maturity";

import { cn } from "@/lib/ui/generic";
import { CardMaturity } from "@/lib/enums";

/**
 * Card maturity indicator bar, displayed as a line with dots representing states. Each dot has a label and an SVG icon
 * corresponding to its maturity state. The current state is highlighted with accent colors and increased size.
 *
 * @param props Component properties.
 * @param props.currentMaturity Current maturity state.
 * @returns The component.
 */
export function MaturityBar({ currentMaturity }: { currentMaturity: CardMaturity }) {
    return (
        <div className="py-12">
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
                            <div className="absolute top-[-85%]">
                                <maturity.icon
                                    className={`size-6 transition-colors ${
                                        (index as CardMaturity) === currentMaturity
                                            ? "text-accent"
                                            : "text-muted"
                                    }`}
                                    aria-label={`${maturity.name} icon`}
                                />
                            </div>
                            <div className="absolute -bottom-3/4 text-sm">{maturity.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
