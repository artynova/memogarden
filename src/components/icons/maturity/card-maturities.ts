import { CardBudding } from "@/components/icons/maturity/card-budding";
import { CardMature } from "@/components/icons/maturity/card-mature";
import { CardMighty } from "@/components/icons/maturity/card-mighty";
import { CardSapling } from "@/components/icons/maturity/card-sapling";
import { CardSeed } from "@/components/icons/maturity/card-seed";
import { CardSprout } from "@/components/icons/maturity/card-sprout";
import { ElementType } from "react";

/**
 * Data required to render a single card maturity stage (its icon and its name).
 */
export interface CardMaturityRenderData {
    /**
     * Icon element function.
     */
    icon: ElementType<{ className?: string | undefined }>;
    /**
     * Maturity state's name (label).
     */
    name: string;
}

/**
 * Array whose elements provide render data for card maturity enum members of the corresponding index (e.g., first
 * element of the array - for the first enum member).
 */
export const cardMaturities: CardMaturityRenderData[] = [
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
