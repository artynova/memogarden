"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SelectCardPreview } from "@/server/data/services/card";
import { DateTime } from "luxon";
import { textFineClass, textProblemClass, textWarningClass } from "@/lib/ui";
import { CardState } from "@/lib/spaced-repetition";
import { LimitedTextSpan } from "@/components/ui/limited-text-span";
import removeMd from "remove-markdown";

const MAX_FRONT_PREVIEW_LENGTH_DESKTOP = 30;
const MAX_FRONT_PREVIEW_LENGTH_MOBILE = 10;
const MAX_DECK_NAME_LENGTH_DESKTOP = 30;
const MAX_DECK_NAME_LENGTH_MOBILE = 10;

export const columns: ColumnDef<SelectCardPreview>[] = [
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
        cell: ({ row }) => {
            const retrievability = row.getValue<number | null>("retrievability");
            if (retrievability === null) return "N/A";
            return retrievability;
        },
    },
    {
        accessorKey: "due",
        header: "Due Date",
        cell: ({ row }) => {
            const dueDateTime = DateTime.fromJSDate(row.getValue("due"));
            const dueDate = dueDateTime.startOf("day");
            const nowDate = DateTime.now().startOf("day");
            const isNew = (row.original.stateId as CardState) === CardState.New;
            return (
                <div
                    className={
                        isNew
                            ? ""
                            : nowDate < dueDate
                              ? textFineClass
                              : nowDate === dueDate
                                ? textWarningClass
                                : textProblemClass
                    }
                >
                    {isNew ? "N/A" : dueDateTime.toLocaleString(DateTime.DATE_SHORT)}
                </div>
            );
        },
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
