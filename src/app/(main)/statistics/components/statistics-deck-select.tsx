"use client";

import { useRouter } from "next/navigation";
import { ControlledSelect } from "@/components/controlled-select";

import { NO_DECK_OPTION, SelectOption } from "@/lib/utils/input";

/**
 * Deck selector for the statistics page.
 *
 * @param props Component properties.
 * @param props.deckId Current deck ID (or `null`).
 * @param props.deckOptions Available deck options.
 * @returns The component.
 */
export function StatisticsDeckSelect({
    deckId,
    deckOptions,
}: {
    deckId: string | null;
    deckOptions: SelectOption[];
}) {
    const router = useRouter();

    return (
        <ControlledSelect
            options={[{ value: NO_DECK_OPTION, label: "All decks" }, ...deckOptions]}
            innerLabel="Select deck to view"
            value={deckId ?? NO_DECK_OPTION}
            onValueChange={(value: string) => {
                router.push(`/statistics${value === NO_DECK_OPTION ? "" : "?deckId=" + value}`);
            }}
            className="max-w-[35%] sm:max-w-[20%]"
        />
    );
}
