import { searchCards } from "@/server/data/services/card";
import {
    getSyncedUserInProtectedRoute,
    parseIntParam,
    parseStringParam,
    SearchParam,
} from "@/lib/server-utils";
import { Pagination } from "@/server/data/services/utils";
import { BrowsePage } from "@/app/browse/components/browse-page";
import { getDeckOptions } from "@/server/data/services/deck";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export interface PageProps {
    searchParams: Promise<{ [key: string]: SearchParam }>;
}

export default async function Page({ searchParams }: PageProps) {
    const user = await getSyncedUserInProtectedRoute();
    const { page: pageRaw, query: queryRaw, deckId: deckIdRaw } = await searchParams;
    const parsedPage = parseIntParam(pageRaw);
    const pagination: Pagination = {
        page: parseIntParam(pageRaw) ?? 1,
        pageSize: PAGE_SIZE,
    };
    const parsedQuery = parseStringParam(queryRaw);
    const query = parsedQuery ?? "";
    const deckId = parseStringParam(deckIdRaw);

    // Perform the search against the database to determine whether the requested page is valid
    const searchResults = await searchCards(user.id, pagination, query, deckId);

    // Create valid sorted search parameters and real sorted search parameters for comparison
    const validParams = new URLSearchParams();
    if (searchResults.page !== 1) validParams.append("page", searchResults.page.toString());
    if (query) validParams.append("query", query);
    if (deckId) validParams.append("deckId", deckId);
    validParams.sort();
    const realParams = new URLSearchParams();
    if (parsedPage !== null) realParams.append("page", parsedPage.toString());
    if (parsedQuery !== null) realParams.append("query", parsedQuery);
    if (deckId !== null) realParams.append("deckId", deckId);
    realParams.sort();

    // Redirect if real parameters do not match valid parameters (e.g., the search revealed that the requested results page is inaccessible)
    if (validParams.toString() !== realParams.toString()) {
        redirect(`/browse${validParams.toString() ? "?" : ""}${validParams}`);
    }

    const deckOptions = await getDeckOptions(user.id);
    return (
        <BrowsePage
            user={user}
            requestedPagination={pagination}
            searchResults={searchResults}
            deckOptions={deckOptions}
        />
    );
}
