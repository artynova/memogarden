"use client";

import { AccessorKeyColumnDef } from "@tanstack/react-table";
import { SelectCardPreview } from "@/server/data/services/card";
import { LimitedTextSpan } from "@/components/limited-text-span";
import removeMd from "remove-markdown";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { getLocaleDateString } from "@/lib/ui/generic";

const MAX_FRONT_PREVIEW_LENGTH_DESKTOP = 30;
const MAX_FRONT_PREVIEW_LENGTH_MOBILE = 8;
const MAX_DECK_NAME_LENGTH_DESKTOP = 30;
const MAX_DECK_NAME_LENGTH_MOBILE = 8;

/**
 * Card preview data combined with the user's timezone.
 */
export interface SelectCardPreviewWithTimezone extends SelectCardPreview {
    /**
     * IANA timezone string.
     */
    timezone: string;
}

/**
 * Browsing results table columns.
 */
export const columns: AccessorKeyColumnDef<SelectCardPreviewWithTimezone>[] = [
    {
        accessorKey: "front",
        header: "Front",
        cell: ({ row }) => (
            <LimitedTextSpan
                text={removeMd(row.original.front)}
                maxLength={MAX_FRONT_PREVIEW_LENGTH_DESKTOP}
                maxLengthMobile={MAX_FRONT_PREVIEW_LENGTH_MOBILE}
            />
        ),
    },
    {
        accessorKey: "retrievability",
        header: "Health",
        cell: ({ row }) => (
            <HealthBar retrievability={row.original.retrievability} className="h-4 w-10 sm:w-16" />
        ),
    },
    {
        accessorKey: "due",
        header: "Due",
        cell: ({ row }) => (
            <span>{getLocaleDateString(row.original.due, row.original.timezone)}</span>
        ),
    },
    {
        accessorKey: "deckName",
        header: "Deck",
        cell: ({ row }) => (
            <LimitedTextSpan
                text={row.original.deckName}
                maxLength={MAX_DECK_NAME_LENGTH_DESKTOP}
                maxLengthMobile={MAX_DECK_NAME_LENGTH_MOBILE}
            />
        ),
    },
];
