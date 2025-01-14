import React, { ElementType } from "react";
import { CardMaturity } from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";
import { CardSprout } from "@/components/ui/icons/card-sprout";
import { CardSeed } from "@/components/ui/icons/card-seed";
import { CardSapling } from "@/components/ui/icons/card-sapling";
import { CardBudding } from "@/components/ui/icons/card-budding";
import { CardMature } from "@/components/ui/icons/card-mature";
import { CardMighty } from "@/components/ui/icons/card-mighty";

interface CardMaturityRenderData {
    icon: ElementType<{ className?: string | undefined }>;
    name: string;
}

const stages: CardMaturityRenderData[] = [
    {
        icon: CardSeed,
        name: "Seed",
    },
    {
        icon: CardSprout,
        name: "Sprout",
    },
    {
        icon: CardSapling,
        name: "Sapling",
    },
    {
        icon: CardBudding,
        name: "Budding",
    },
    {
        icon: CardMature,
        name: "Mature",
    },
    {
        icon: CardMighty,
        name: "Mighty",
    },
];

export interface MaturityBarProps {
    currentMaturity: CardMaturity;
}

export function MaturityBar({ currentMaturity }: MaturityBarProps) {
    return (
        <div className={"py-[7%]"}>
            <div className="relative flex w-full items-center justify-between">
                <div className="absolute h-1 w-full bg-muted" />
                {stages.map((stage, index) => (
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
                                        : "border-ring",
                                )}
                            />
                            <div className={"absolute top-[-85%]"}>
                                <stage.icon
                                    className={`size-6 transition-colors ${
                                        (index as CardMaturity) === currentMaturity
                                            ? "text-accent"
                                            : "text-muted"
                                    }`}
                                />
                            </div>
                            <div className={"absolute -bottom-3/4"}>{stage.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
