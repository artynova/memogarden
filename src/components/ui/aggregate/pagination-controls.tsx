import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/base/pagination";
import { Url } from "@/lib/utils";

export interface PaginationControlsProps {
    pageIndex: number;
    totalPages: number;
    indexToHref: (pageIndex: number) => Url;
    maxItemsInList?: number;
}

/**
 * Default number of pagination list items (including ellipses to the left and right of the current page, if used) that
 * can be displayed by the pagination component at maximum. This value is used to decide whether ellipses on either side
 * of the active page button are required or not if another explicit value is not provided in component properties.
 */
const MAX_ITEMS_IN_LIST = 7;

interface PageListItem {
    /**
     * By default, the item is assumed to be a page if the kind is not provided.
     */
    kind?: "page" | "ellipsis";
}

interface PageListPage extends PageListItem {
    kind?: "page";
    index: number;
}

function makePageItem(pageIndex: number): PageListPage {
    return { index: pageIndex };
}

function isPageItem(item: PageListItem): item is PageListPage {
    return !item.kind || item.kind === "page";
}

interface PageListEllipsis extends PageListItem {
    kind: "ellipsis";
}

function makeEllipsisItem(): PageListEllipsis {
    return { kind: "ellipsis" };
}

function prepareListItems(pageIndex: number, totalPages: number) {
    const pageListItems: PageListItem[] = [];

    // Case when there is enough space to fit all page links comfortably and any ellipses are unnecessary
    if (totalPages <= MAX_ITEMS_IN_LIST) {
        for (let i = 0; i < totalPages; i++) pageListItems.push(makePageItem(i));
        return pageListItems;
    }

    const edgeItems = Math.floor(MAX_ITEMS_IN_LIST / 2); // How many items need to appear near a single edge (either the page links themselves, e.g. "1, 2, 3", or page links with an ellipsis after the edge page, e.g. "1, ..., 3")
    const useEllipsisLeft = pageIndex >= edgeItems;
    const useEllipsisRight = pageIndex < totalPages - edgeItems;

    if (useEllipsisLeft && !useEllipsisRight) {
        pageListItems.push(makePageItem(0));
        pageListItems.push(makeEllipsisItem());
        const remainingItems = edgeItems * 2 - 2; // Total number of items on both edges minus the 2 items that were already pushed (the first page and the ellipsis)
        for (let i = totalPages - remainingItems; i < totalPages; i++)
            pageListItems.push(makePageItem(i));
        return pageListItems;
    }

    if (!useEllipsisLeft && useEllipsisRight) {
        const initialItems = edgeItems * 2 - 2;
        for (let i = 0; i < initialItems; i++) pageListItems.push(makePageItem(i));
        pageListItems.push(makeEllipsisItem());
        pageListItems.push(makePageItem(totalPages - 1)); // Last page
        return pageListItems;
    }

    // Case when both ellipses are used
    pageListItems.push(makePageItem(0));
    pageListItems.push(makeEllipsisItem());
    // Push all items in the middle (including the central current page item)
    for (let i = pageIndex - edgeItems + 2; i <= pageIndex + edgeItems - 2; i++)
        pageListItems.push(makePageItem(i));
    pageListItems.push(makeEllipsisItem());
    pageListItems.push(makePageItem(totalPages - 1));
    return pageListItems;
}

/**
 * Simple link-based pagination control bar with numbered buttons and relative "previous" and "next" buttons.
 * Assumes that pagination parameters are determined by the route.
 *
 * @param pageIndex Current page's index (starting from 0).
 * @param totalPages Total number of pages.
 * @param indexToHref Function that converts a given valid numeric page index into a URL that, upon navigation,
 * will display the corresponding page of the paginated collection to the user.
 */
export function PaginationControls({
    pageIndex,
    totalPages,
    indexToHref,
}: PaginationControlsProps) {
    const pageListItems: PageListItem[] = prepareListItems(pageIndex, totalPages);

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={pageIndex > 0 ? indexToHref(pageIndex - 1) : {}}
                        disabled={pageIndex <= 0}
                    />
                </PaginationItem>
                {pageListItems.map((item, index) => (
                    <PaginationItem key={index}>
                        {isPageItem(item) ? (
                            <PaginationLink
                                href={indexToHref(item.index)}
                                isActive={pageIndex === item.index}
                            >
                                {item.index + 1}
                            </PaginationLink>
                        ) : (
                            <PaginationEllipsis />
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href={pageIndex < totalPages - 1 ? indexToHref(pageIndex + 1) : {}}
                        disabled={pageIndex >= totalPages - 1}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
