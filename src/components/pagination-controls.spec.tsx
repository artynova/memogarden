import { describe, expect, test } from "vitest";
import { PaginationControls } from "@/components/pagination-controls";
import { render, screen } from "@testing-library/react";

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
])(PaginationControls, ({ pageIndex, totalPages, expectedList, expectedActiveIndexInList }) => {
    const conditionString = `when given page index ${pageIndex} (1-based) and total number of pages ${totalPages}`;

    test(`should correctly render the 'Previous' button ${conditionString}`, () => {
        const expectedPrevDisabled = pageIndex === 1;
        render(
            <PaginationControls
                pageIndex={pageIndex}
                totalPages={totalPages}
                indexToHref={(index) => `/test_url?page=${index}`}
            />,
        );

        const prevByRole = screen.queryByRole(expectedPrevDisabled ? "button" : "link", {
            name: /previous/i,
        });
        const prevByDom = screen.queryByRole("list")?.firstChild?.firstChild;

        expect(prevByRole).toBeInTheDocument();
        if (expectedPrevDisabled) expect(prevByRole).toBeDisabled();
        else expect(prevByRole).toHaveAttribute("href", `/test_url?page=${pageIndex - 1}`);
        expect(prevByRole).toBe(prevByDom);
    });

    test(`should correctly render the 'Next' button ${conditionString}`, () => {
        const expectedNextDisabled = pageIndex === totalPages;
        render(
            <PaginationControls
                pageIndex={pageIndex}
                totalPages={totalPages}
                indexToHref={(index) => `/test_url?page=${index}`}
            />,
        );

        const nextByRole = screen.getByRole(expectedNextDisabled ? "button" : "link", {
            name: /next/i,
        });
        const nextByDom = screen.getByRole("list").lastChild?.firstChild;

        expect(nextByRole).toBeInTheDocument();
        if (expectedNextDisabled) expect(nextByRole).toBeDisabled();
        else expect(nextByRole).toHaveAttribute("href", `/test_url?page=${pageIndex + 1}`);
        expect(nextByRole).toBe(nextByDom);
    });

    test(`should correctly render pagination list items ${conditionString}`, () => {
        render(
            <PaginationControls
                pageIndex={pageIndex}
                totalPages={totalPages}
                indexToHref={(index) => `/test_url?page=${index}`}
            />,
        );
        const dynamicItems = screen.getAllByRole("listitem").slice(1, -1);

        expect(dynamicItems.length).toEqual(expectedList.length);
        dynamicItems.forEach((item, index) => {
            // Ellipsis case
            if (expectedList[index] === null) {
                const svgs = item.getElementsByTagName("svg");
                expect(svgs.length).toEqual(1);
            }
            // Page link case
            else {
                const links = item.getElementsByTagName("a");
                expect(links.length).toEqual(1);
                const link = links[0];
                expect(link).toHaveAttribute("href", `/test_url?page=${expectedList[index]}`);
                expect(link).toHaveTextContent(`${expectedList[index]}`);
                if (index === expectedActiveIndexInList)
                    expect(link).toHaveAttribute("aria-current", "page"); // Marker of the current page
            }
        });
    });
});
