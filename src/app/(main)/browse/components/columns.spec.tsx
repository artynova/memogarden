import { columns, SelectCardPreviewWithTimezone } from "@/app/(main)/browse/components/columns";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { getLocaleDateString } from "@/lib/ui/generic";
import { AccessorKeyColumnDef } from "@tanstack/react-table";
import { render } from "@testing-library/react";
import { ReactElement } from "react";
import removeMd from "remove-markdown";
import { describe, expect, test, vi } from "vitest";

vi.mock("remove-markdown");
vi.mock("@/components/limited-text-span");
vi.mock("@/components/resource/bars/health-bar");
vi.mock("@/lib/ui/generic");

const mockedRemoveMd = vi.mocked(removeMd);
const mockedLimitedTextSpan = vi.mocked(LimitedTextSpan);
const mockedHealthBar = vi.mocked(HealthBar);
const mockedGetLocaleDateString = vi.mocked(getLocaleDateString);

function renderTableCellWithOriginal<T>(column: AccessorKeyColumnDef<T>, original: object) {
    const row = { original };
    const Cell = column.cell as (props: { row: object }) => ReactElement;
    render(<Cell row={row} />);
}

describe("columns", () => {
    describe(`column '${columns[0].accessorKey}'`, () => {
        const column = columns[0];

        describe.each([
            {
                card: {
                    front: "b",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    front: "Hello",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    front: "Guten Tag",
                } as SelectCardPreviewWithTimezone,
            },
        ])("given card data $card", ({ card }) => {
            test("should render trimmed card front with removed markdown", () => {
                mockedRemoveMd.mockImplementation((markdown) => markdown);
                renderTableCellWithOriginal(column, card);

                expect(mockedRemoveMd).toHaveBeenCalledExactlyOnceWith(card.front);
                expect(mockedLimitedTextSpan).toHaveBeenCalledOnceWithProps({ text: card.front });
            });
        });
    });

    describe(`column '${columns[1].accessorKey}'`, () => {
        const column = columns[1];

        describe.each([
            {
                card: {
                    retrievability: 0,
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    retrievability: 0.5,
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    retrievability: 1,
                } as SelectCardPreviewWithTimezone,
            },
        ])("given card data $card", ({ card }) => {
            test("should render a plain health bar based on card retrievability", () => {
                renderTableCellWithOriginal(column, card);

                expect(mockedHealthBar).toHaveBeenCalledOnceWithProps({
                    retrievability: card.retrievability,
                });
            });
        });
    });

    describe(`column '${columns[2].accessorKey}'`, () => {
        const column = columns[2];

        describe.each([
            {
                card: {
                    due: new Date("2025-01-21T15:24:17.000Z"),
                    timezone: "America/New_York",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    due: new Date("2024-05-15T12:32:58.000Z"),
                    timezone: "Europe/Berlin",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    due: new Date("2025-02-13T17:13:44.000Z"),
                    timezone: "Etc/UTC",
                } as SelectCardPreviewWithTimezone,
            },
        ])("given card data $card", ({ card }) => {
            test("should render a locale date string for the card due date in user's timezone", () => {
                renderTableCellWithOriginal(column, card);

                expect(mockedGetLocaleDateString).toHaveBeenCalledExactlyOnceWith(
                    card.due,
                    card.timezone,
                );
            });
        });
    });

    describe(`column '${columns[3].accessorKey}'`, () => {
        const column = columns[3];

        describe.each([
            {
                card: {
                    deckName: "Deck1",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    deckName: "English",
                } as SelectCardPreviewWithTimezone,
            },
            {
                card: {
                    deckName: "German",
                } as SelectCardPreviewWithTimezone,
            },
        ])("given card data $card", ({ card }) => {
            test("should render trimmed deck name", () => {
                renderTableCellWithOriginal(column, card);

                expect(mockedLimitedTextSpan).toHaveBeenCalledOnceWithProps({
                    text: card.deckName,
                });
            });
        });
    });
});
