import { describe, expect, test } from "vitest";
import { PaginationControls } from "@/components/pagination-controls";
import { render, screen } from "@testing-library/react";

describe(PaginationControls, () => {
    function indexToHref(index: number) {
        return `/test_url?page=${index}`;
    }
    // null in the expected items list stands for the ellipsis item
    describe.each([
        {
            pageIndex: 1,
            totalPages: 1,
            expectedList: [1],
            expectedActiveIndexInList: 0,
        },
        {
            pageIndex: 1,
            totalPages: 2,
            expectedList: [1, 2],
            expectedActiveIndexInList: 0,
        },
        {
            pageIndex: 2,
            totalPages: 2,
            expectedList: [1, 2],
            expectedActiveIndexInList: 1,
        },
        {
            pageIndex: 1,
            totalPages: 3,
            expectedList: [1, 2, 3],
            expectedActiveIndexInList: 0,
        },
        {
            pageIndex: 2,
            totalPages: 3,
            expectedList: [1, 2, 3],
            expectedActiveIndexInList: 1,
        },
        {
            pageIndex: 3,
            totalPages: 3,
            expectedList: [1, 2, 3],
            expectedActiveIndexInList: 2,
        },
        {
            pageIndex: 1,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 0,
        },
        {
            pageIndex: 2,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 1,
        },
        {
            pageIndex: 3,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 2,
        },
        {
            pageIndex: 4,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 3,
        },
        {
            pageIndex: 5,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 4,
        },
        {
            pageIndex: 6,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 5,
        },
        {
            pageIndex: 7,
            totalPages: 7,
            expectedList: [1, 2, 3, 4, 5, 6, 7],
            expectedActiveIndexInList: 6,
        },
        {
            pageIndex: 1,
            totalPages: 8,
            expectedList: [1, 2, 3, 4, null, 8],
            expectedActiveIndexInList: 0,
        },
        {
            pageIndex: 2,
            totalPages: 8,
            expectedList: [1, 2, 3, 4, null, 8],
            expectedActiveIndexInList: 1,
        },
        {
            pageIndex: 3,
            totalPages: 8,
            expectedList: [1, 2, 3, 4, null, 8],
            expectedActiveIndexInList: 2,
        },
        {
            pageIndex: 4,
            totalPages: 8,
            expectedList: [1, null, 3, 4, 5, null, 8],
            expectedActiveIndexInList: 3,
        },
        {
            pageIndex: 5,
            totalPages: 8,
            expectedList: [1, null, 4, 5, 6, null, 8],
            expectedActiveIndexInList: 3,
        },
        {
            pageIndex: 6,
            totalPages: 8,
            expectedList: [1, null, 5, 6, 7, 8],
            expectedActiveIndexInList: 3,
        },
        {
            pageIndex: 7,
            totalPages: 8,
            expectedList: [1, null, 5, 6, 7, 8],
            expectedActiveIndexInList: 4,
        },
        {
            pageIndex: 8,
            totalPages: 8,
            expectedList: [1, null, 5, 6, 7, 8],
            expectedActiveIndexInList: 5,
        },
    ])(
        "given page index $pageIndex and total pages $totalPages",
        ({ pageIndex, totalPages, expectedList, expectedActiveIndex }) => {
            if (pageIndex === 1) {
                test(`should render disabled 'Previous' button before all pagination items`, () => {
                    render(
                        <PaginationControls
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            indexToHref={indexToHref}
                        />,
                    );
                    const prevByRole = screen.queryByRole("button", { name: /previous/i });
                    const prevByDom = screen.queryByRole("list")?.firstChild?.firstChild;

                    expect(prevByRole).toBeInTheDocument();
                    expect(prevByRole).toBeDisabled();
                    expect(prevByRole).toBe(prevByDom);
                });
            } else {
                test(`should render enabled 'Previous' button as link with correct href before all pagination items`, () => {
                    render(
                        <PaginationControls
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            indexToHref={indexToHref}
                        />,
                    );
                    const prevByRole = screen.queryByRole("link", { name: /previous/i });
                    const prevByDom = screen.queryByRole("list")?.firstChild?.firstChild;

                    expect(prevByRole).toBeInTheDocument();
                    expect(prevByRole).toHaveAttribute("href", indexToHref(pageIndex - 1));
                    expect(prevByRole).toBe(prevByDom);
                });
            }

            if (pageIndex === totalPages) {
                test(`should render disabled 'Next' button after all pagination items`, () => {
                    render(
                        <PaginationControls
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            indexToHref={indexToHref}
                        />,
                    );
                    const nextByRole = screen.getByRole("button", { name: /next/i });
                    const nextByDom = screen.getByRole("list").lastChild?.firstChild;

                    expect(nextByRole).toBeInTheDocument();
                    expect(nextByRole).toBeDisabled();
                    expect(nextByRole).toBe(nextByDom);
                });
            } else {
                test(`should render enabled 'Next' button as link with correct href after all pagination items`, () => {
                    render(
                        <PaginationControls
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            indexToHref={indexToHref}
                        />,
                    );
                    const nextByRole = screen.getByRole("link", { name: /next/i });
                    const nextByDom = screen.getByRole("list").lastChild?.firstChild;

                    expect(nextByRole).toBeInTheDocument();
                    expect(nextByRole).toHaveAttribute("href", indexToHref(pageIndex + 1));
                    expect(nextByRole).toBe(nextByDom);
                });
            }

            test(`should render ${expectedList.length} dynamic pagination items`, () => {
                render(
                    <PaginationControls
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        indexToHref={indexToHref}
                    />,
                );
                const items = screen.getAllByRole("listitem").slice(1, -1);

                expect(items.length).toEqual(expectedList.length);
            });

            describe.each(expectedList.map((item, index) => ({ item, index })))(
                "for dynamic pagination item at index $index",
                ({ item, index }) => {
                    if (item === null) {
                        test("should render item as ellipsis", () => {
                            render(
                                <PaginationControls
                                    pageIndex={pageIndex}
                                    totalPages={totalPages}
                                    indexToHref={indexToHref}
                                />,
                            );
                            const itemElement = screen.getAllByRole("listitem").slice(1, -1)[index];
                            const svgs = itemElement.getElementsByTagName("svg");

                            expect(svgs.length).toEqual(1);
                        });
                    } else {
                        test(`should render item as link with content ${item} and correct href`, () => {
                            render(
                                <PaginationControls
                                    pageIndex={pageIndex}
                                    totalPages={totalPages}
                                    indexToHref={indexToHref}
                                />,
                            );
                            const itemElement = screen.getAllByRole("listitem").slice(1, -1)[index];
                            const links = itemElement.getElementsByTagName("a");
                            const link = links[0];

                            expect(links.length).toEqual(1);
                            expect(link).toHaveAttribute("href", indexToHref(item));
                            expect(link).toHaveTextContent(`${item}`);
                        });

                        if (index === expectedActiveIndex) {
                            test(`should mark item as corresponding to current page`, () => {
                                const itemElement = screen.getAllByRole("listitem").slice(1, -1)[
                                    index
                                ];
                                const link = itemElement.getElementsByTagName("a")[0];

                                expect(link).toHaveAttribute("aria-current", "page");
                            });
                        }
                    }
                },
            );
        },
    );
});
