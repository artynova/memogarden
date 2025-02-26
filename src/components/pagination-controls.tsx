import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/shadcn/pagination";
import { Url } from "@/lib/utils/generic";

/**
 * Maximum number of page list items (including ellipses to the left and right of the current page, if used) that can be
 * displayed by the controls component. This value is used to decide whether ellipses on either side of the active page
 * button are required or not.
 */
export const MAX_ITEMS_IN_LIST = 7;

/**
 * Page item in the controls page list, described by the index it shows (1-based).
 */
type PageListPage = number;

/**
 * Ellipsis item in the controls page list, used as a stand-in for multiple pages for compactness.
 */
type PageListEllipsis = null;

/**
 * Item in the controls page list.
 */
type PageListItem = PageListPage | PageListEllipsis;

/**
 * Tests whether a page list item describes a specific page.
 *
 * @param item Item to be tested.
 * @returns `true` if the item is a {@link PageListPage} item, `false` otherwise.
 */
function isPageItem(item: PageListItem): item is PageListPage {
    return item != undefined;
}

/**
 * Prepares a list of page button entries (both for individual pages and for ellipses).
 *
 * @param pageIndex Current page's index (starting from 0).
 * @param totalPages Total number of pages.
 * @returns Array of page list items with ellipses inserted where necessary.
 */
function prepareListItems(pageIndex: number, totalPages: number) {
    const pageListItems: PageListItem[] = [];

    // Case when there is enough space to fit all page links comfortably and any ellipses are unnecessary
    if (totalPages <= MAX_ITEMS_IN_LIST) {
        for (let i = 0; i < totalPages; i++) pageListItems.push(i + 1); // Use 1-based indexing for items
        return pageListItems;
    }

    const edgeItems = Math.floor(MAX_ITEMS_IN_LIST / 2); // How many items need to appear near a single edge (either the page links themselves, e.g. "1, 2, 3", or page links with an ellipsis after the edge page, e.g. "1, ..., 3")
    const useEllipsisLeft = pageIndex >= edgeItems;
    const useEllipsisRight = pageIndex < totalPages - edgeItems;

    if (useEllipsisLeft && !useEllipsisRight) {
        pageListItems.push(1);
        pageListItems.push(null);
        const remainingItems = edgeItems * 2 - 2; // Total number of items on both edges minus the 2 items that were already pushed (the first page and the ellipsis)
        for (let i = totalPages - remainingItems; i < totalPages; i++) pageListItems.push(i + 1);
        return pageListItems;
    }

    if (!useEllipsisLeft && useEllipsisRight) {
        const initialItems = edgeItems * 2 - 2;
        for (let i = 0; i < initialItems; i++) pageListItems.push(i + 1);
        pageListItems.push(null);
        pageListItems.push(totalPages); // Last page
        return pageListItems;
    }

    // Case when both ellipses are used
    pageListItems.push(1);
    pageListItems.push(null);
    // Push all items in the middle (including the central current page item)
    for (let i = pageIndex - edgeItems + 2; i <= pageIndex + edgeItems - 2; i++)
        pageListItems.push(i + 1);
    pageListItems.push(null);
    pageListItems.push(totalPages);
    return pageListItems;
}

/**
 * Simple link-based pagination control bar with numbered buttons and relative "previous" and "next" buttons.
 * Assumes that pagination parameters are determined by the route.
 *
 * @param props Component properties.
 * @param props.pageIndex Current page's index (starting from 1, aligning with other pagination APIs).
 * @param props.totalPages Total number of pages.
 * @param props.indexToHref Function that converts a given valid numeric page index (starting from 1) into a URL that, upon
 * navigation, will display the corresponding page of the paginated collection to the user. For example, when passed
 * `1`, it should return the URL for the first page in the collection.
 * @returns The component.
 */
export function PaginationControls({
    pageIndex,
    totalPages,
    indexToHref,
}: {
    pageIndex: number;
    totalPages: number;
    indexToHref: (pageIndex: number) => Url;
}) {
    const pageIndexInternal = pageIndex - 1; // Convert to 0-based indexing for internal calculations; values passed to callbacks still use 1-based indexing
    const pageListItems: PageListItem[] = prepareListItems(pageIndexInternal, totalPages);

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={pageIndexInternal > 0 ? indexToHref(pageIndex - 1) : {}}
                        disabled={pageIndexInternal <= 0}
                    />
                </PaginationItem>
                {pageListItems.map((item, index) => (
                    <PaginationItem key={index}>
                        {isPageItem(item) ? (
                            <PaginationLink href={indexToHref(item)} isActive={pageIndex === item}>
                                {item}
                            </PaginationLink>
                        ) : (
                            <PaginationEllipsis />
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href={pageIndexInternal < totalPages - 1 ? indexToHref(pageIndex + 1) : {}}
                        disabled={pageIndexInternal >= totalPages - 1}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
