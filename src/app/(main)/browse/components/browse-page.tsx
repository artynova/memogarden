"use client";

import { FooterActionData, PageTemplate } from "@/components/page/main/template/page-template";
import { SelectUser } from "@/server/data/services/user";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModifyCardData } from "@/server/actions/card/schemas";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { CardForm } from "@/components/resource/card-form";
import { createNewCard } from "@/server/actions/card/actions";
import { PaginatedCardPreviews } from "@/server/data/services/card";
import { ResultsTable } from "@/app/(main)/browse/components/results-table";
import { Pagination } from "@/server/data/services/utils";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { ControlledSelect } from "@/components/controlled-select";
import { FolderPlus, Search, SquarePlus } from "lucide-react";
import { PaginationControls } from "@/components/pagination-controls";
import { createNewDeck } from "@/server/actions/deck/actions";
import { DeckForm } from "@/components/resource/deck-form";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/modal/controlled-modal-collection";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { ModifyDeckData } from "@/server/actions/deck/schemas";

import { SelectOption } from "@/lib/utils/input";

const NO_DECK_FILTER_OPTION = "any";

/**
 * Parsed and validated search parameters for the browsing page.
 */
export type ResolvedParams = {
    /**
     * Page number (1-indexed).
     */
    page: number;
};

/**
 * Client part of the card browsing page.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.pagination Validated pagination settings.
 * @param props.query Search query, or an empty string if none is provided.
 * @param props.deckId Validated ID of the deck to filter by, or `null to search the entire collection.
 * @param props.searchResults Results of the database search with the specified search parameters.
 * @param props.deckOptions Options for the deck filter selection field.
 * @returns The component.
 */
export function BrowsePage({
    user,
    pagination,
    query,
    deckId,
    searchResults,
    deckOptions,
}: {
    user: SelectUser;
    pagination: Pagination;
    query: string;
    deckId: string | null;
    searchResults: PaginatedCardPreviews;
    deckOptions: SelectOption[];
}) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [inputQuery, setInputQuery] = useState(query);

    const totalPages = Math.ceil(searchResults.totalCards / pagination.pageSize);
    const deckFilter = deckId ?? NO_DECK_FILTER_OPTION;

    function pageIndexToHref(index: number) {
        const params = new URLSearchParams(searchParams);
        if (index === 0) params.delete("page");
        else params.set("page", index.toString());
        return `/browse?${params}`;
    }

    function onSearchSubmit(query: string, deckFilter: string) {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (deckFilter !== NO_DECK_FILTER_OPTION) params.set("deckId", deckFilter);
        router.push(`/browse?${params}`);
    }

    async function onNewDeckSubmit(data: ModifyDeckData) {
        await createNewDeck(data);
        setCurrentModalIndex(null);
        router.refresh();
    }

    async function onNewCardSubmit(data: ModifyCardData) {
        await createNewCard(data);
        setCurrentModalIndex(null);
        router.refresh();
    }

    const modals: ModalData[] = [
        {
            title: "New deck",
            description: "Create a new deck.",
            children: (
                <DeckForm
                    onSubmit={ignoreAsyncFnResult(onNewDeckSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                />
            ),
        },
        {
            title: "New card",
            description: "Create a new card.",
            children: (
                <CardForm
                    onSubmit={ignoreAsyncFnResult(onNewCardSubmit)}
                    onCancel={() => setCurrentModalIndex(null)}
                    deckOptions={deckOptions}
                />
            ),
        },
    ];

    const footerActions: FooterActionData[] = [
        {
            Icon: FolderPlus,
            text: "New Deck",
            action: () => setCurrentModalIndex(0), // Index of the deck modal (first in the array)
        },
        {
            Icon: SquarePlus,
            text: "New Card",
            action: () => setCurrentModalIndex(1), // Index of the card modal (second in the array)
        },
    ];

    return (
        <PageTemplate title="Search Cards" user={user} footerActions={footerActions}>
            <ContentWrapper>
                <div className="flex gap-x-2">
                    <Input
                        placeholder="Filter by front or back content"
                        defaultValue={inputQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setInputQuery(e.target.value)
                        }
                        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                onSearchSubmit(inputQuery, deckFilter);
                            }
                        }}
                        aria-label="Search"
                    />
                    <Button
                        onClick={() => {
                            onSearchSubmit(inputQuery, deckFilter);
                        }}
                    >
                        Search
                        <Search aria-label="Search icon" />
                    </Button>
                </div>
                <div className="flex items-center gap-x-8">
                    <ControlledSelect
                        options={[
                            { value: NO_DECK_FILTER_OPTION, label: "All decks" },
                            ...deckOptions,
                        ]}
                        innerLabel="Filter by deck"
                        value={deckFilter}
                        onValueChange={(value: string) => {
                            onSearchSubmit(inputQuery, value);
                        }}
                        className="max-w-[35%] sm:max-w-[20%]"
                    />
                    <div className="grow text-right">{`Cards found: ${searchResults.totalCards}`}</div>
                </div>
                <ResultsTable
                    data={searchResults.pageCards.map((value) => ({
                        ...value,
                        timezone: user.timezone,
                    }))}
                    pagination={pagination}
                />
                <PaginationControls
                    pageIndex={searchResults.page}
                    totalPages={totalPages}
                    indexToHref={pageIndexToHref}
                />
            </ContentWrapper>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
