"use client";

import { useRouter } from "next/navigation";
import { ControlledSelect } from "@/components/ui/controlled-select";
import { SelectOption } from "@/lib/ui";

const NO_DECK_FILTER_OPTION = "any";

export interface StatisticsDeckSelectProps {
    deckId: string | null;
    deckOptions: SelectOption[];
}

export function StatisticsDeckSelect({ deckId, deckOptions }: StatisticsDeckSelectProps) {
    const router = useRouter();

    return (
        <ControlledSelect
            options={[{ value: NO_DECK_FILTER_OPTION, label: "All decks" }, ...deckOptions]}
            innerLabel={"Select deck to view"}
            value={deckId ?? NO_DECK_FILTER_OPTION}
            onValueChange={(value: string) => {
                router.push(
                    `/statistics${value === NO_DECK_FILTER_OPTION ? "" : "?deckId=" + value}`,
                );
            }}
            className={"max-w-[35%] sm:max-w-[20%]"}
        />
    );
}
