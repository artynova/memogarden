"use client";

import { FooterActionData, PageTemplate } from "@/components/ui/page/template/page-template";
import { SelectUser } from "@/server/data/services/user";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModifyCardData, ModifyDeckData } from "@/lib/validation-schemas";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { CardForm } from "@/components/ui/modal/card-form";
import { createNewCard } from "@/server/actions/card";
import { PaginatedCardPreviews } from "@/server/data/services/card";
import { ResultsTable } from "@/app/(main)/browse/components/results-table";
import { Pagination } from "@/server/data/services/utils";
import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { ControlledSelect } from "@/components/ui/controlled-select";
import { SelectOption } from "@/lib/ui";
import { FolderPlus, Search, SquarePlus } from "lucide-react";
import { PaginationControls } from "@/components/ui/aggregate/pagination-controls";
import { createNewDeck } from "@/server/actions/deck";
import { DeckForm } from "@/components/ui/modal/deck-form";
import {
    ControlledModalCollection,
    ModalData,
} from "@/components/ui/modal/controlled-modal-collection";

export interface BrowsePageProps {
    user: SelectUser;
    requestedPagination: Pagination;
    searchResults: PaginatedCardPreviews;
    deckOptions: SelectOption[];
}

const NO_DECK_FILTER_OPTION = "any";

export function BrowsePage({
    user,
    requestedPagination,
    searchResults,
    deckOptions,
}: BrowsePageProps) {
    const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null); // null value means that no modal is open
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("query") ?? "");

    const totalPages = Math.ceil(searchResults.totalCards / requestedPagination.pageSize);
    const deckFilter = searchParams.get("deckId") ?? NO_DECK_FILTER_OPTION;

    function pageIndexToHref(index: number) {
        const params = new URLSearchParams(searchParams);
        if (index === 0) params.delete("page");
        else params.set("page", (index + 1).toString());
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
        <PageTemplate title={"Search Cards"} user={user} footerActions={footerActions}>
            <div className={"mx-auto flex max-w-screen-lg flex-col gap-y-6 p-6"}>
                <div className={"flex gap-x-2"}>
                    <Input
                        placeholder={"Filter by front or back content"}
                        defaultValue={query}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        onKeyUp={(e: KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                onSearchSubmit(query, deckFilter);
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            onSearchSubmit(query, deckFilter);
                        }}
                    >
                        Search
                        <Search />
                    </Button>
                </div>
                <div className={"flex gap-x-8"}>
                    <ControlledSelect
                        options={[
                            { value: NO_DECK_FILTER_OPTION, label: "All decks" },
                            ...deckOptions,
                        ]}
                        innerLabel={"Filter by deck"}
                        value={deckFilter}
                        onValueChange={(value: string) => {
                            onSearchSubmit(query, value);
                        }}
                        className={"max-w-[35%] sm:max-w-[20%]"}
                    />
                    <div
                        className={"grow text-right"}
                    >{`Cards found: ${searchResults.totalCards}`}</div>
                </div>
                <ResultsTable
                    data={searchResults.pageCards}
                    page={searchResults.page}
                    pageSize={requestedPagination.pageSize}
                />
                <PaginationControls
                    pageIndex={searchResults.page - 1}
                    totalPages={totalPages}
                    indexToHref={pageIndexToHref}
                />
            </div>
            <ControlledModalCollection
                modals={modals}
                currentModalIndex={currentModalIndex}
                onCurrentModalChange={setCurrentModalIndex}
            />
        </PageTemplate>
    );
}
