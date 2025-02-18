import { searchCards } from "@/server/data/services/card";
import { PageWithSearchParamsProps, parseIntParam, parseStringParam } from "@/lib/utils/server";
import { Pagination } from "@/server/data/services/utils";
import { BrowsePage } from "@/app/(main)/browse/components/browse-page";
import { getDeckOptions, isDeckAccessible } from "@/server/data/services/deck";
import { notFound, redirect } from "next/navigation";
import { getUserOrRedirectSC } from "@/lib/utils/server";

const PAGE_SIZE = 20;

/**
 * Card browsing page with queries represented as URL search parameters.
 *
 * Valid search parameters:
 * - `page`: Page number (assumed to be 1 if not provided).
 * - `query`: Query string with search terms (assumed to be an empty string if not provided).
 * - `deckId`: ID of the target deck (or nothing to enable collection-wide search).
 *
 * @param props Component properties.
 * @param props.searchParams Search parameters.
 * @returns The component.
 */
export default async function Page({ searchParams }: PageWithSearchParamsProps) {
    const user = await getUserOrRedirectSC();
    const { page: pageRaw, query: queryRaw, deckId: deckIdRaw } = await searchParams;
    const parsedPage = parseIntParam(pageRaw);
    const pagination: Pagination = {
        page: parseIntParam(pageRaw) ?? 1,
        pageSize: PAGE_SIZE,
    };
    const parsedQuery = parseStringParam(queryRaw);
    const query = parsedQuery ?? "";
    const deckId = parseStringParam(deckIdRaw);
    if (deckId && !(await isDeckAccessible(user.id, deckId))) notFound();

    const searchResults = await searchCards(user.id, pagination, query, deckId);

    // Create sorted resolved search parameters and sorted real search parameters for comparison
    const resolvedParams = new URLSearchParams();
    if (searchResults.page !== 1) resolvedParams.append("page", searchResults.page.toString());
    if (query) resolvedParams.append("query", query);
    if (deckId) resolvedParams.append("deckId", deckId);
    resolvedParams.sort();
    const realParams = new URLSearchParams();
    if (parsedPage !== null) realParams.append("page", parsedPage.toString());
    if (parsedQuery !== null) realParams.append("query", parsedQuery);
    if (deckId !== null) realParams.append("deckId", deckId);
    realParams.sort();

    // Redirect if real parameters do not match the resolved parameters (e.g., the search revealed that the requested results page is invalid)
    if (resolvedParams.toString() !== realParams.toString()) {
        redirect(`/browse${resolvedParams.toString() ? "?" : ""}${resolvedParams}`);
    }

    const deckOptions = await getDeckOptions(user.id);
    return (
        <BrowsePage
            user={user}
            pagination={pagination}
            query={query}
            deckId={deckId}
            searchResults={searchResults}
            deckOptions={deckOptions}
        />
    );
}
