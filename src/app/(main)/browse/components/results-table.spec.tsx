import { columns } from "@/app/(main)/browse/components/columns";
import { ResultsTable } from "@/app/(main)/browse/components/results-table";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("next/navigation");

const mockedUseRouter = vi.mocked(useRouter);

describe(ResultsTable, () => {
    const mockRouterPush = vi.fn();
    beforeEach(() => {
        mockedUseRouter.mockReturnValue(fakeCompliantValue({ push: mockRouterPush }));
    });

    describe("given no results data", () => {
        test("should render all headers", () => {
            const { container } = render(
                <ResultsTable data={[]} pagination={{ page: 1, pageSize: 20 }} />,
            );
            const headers = container.getElementsByTagName("th");

            expect(headers.length).toEqual(columns.length);
            columns.forEach((column, index) => {
                expect(headers[index]).toHaveTextContent(column.header as string);
            });
        });

        test("should render a special message in the table", () => {
            render(<ResultsTable data={[]} pagination={{ page: 1, pageSize: 20 }} />);
            const message = screen.queryByText(/no results/i);

            expect(message).toBeInTheDocument();
        });
    });

    describe.each([
        {
            data: [
                {
                    id: "uuid1",
                    retrievability: 0.7,
                    front: "a",
                    due: new Date("2025-03-02T07:16:31.000Z"),
                    deckName: "Japanese",
                    timezone: "America/New_York",
                },
            ],
            pagination: { page: 1, pageSize: 20 },
        },
        {
            data: [
                {
                    id: "uuid1",
                    retrievability: 0.7,
                    front: "a",
                    due: new Date("2025-03-02T07:16:31.000Z"),
                    deckName: "Japanese",
                    timezone: "America/New_York",
                },
                {
                    id: "uuid2",
                    retrievability: 0.5,
                    front: "b",
                    due: new Date("2025-03-01T08:10:25.000Z"),
                    deckName: "Japanese",
                    timezone: "America/New_York",
                },
                {
                    id: "uuid2",
                    retrievability: 0.5,
                    front: "c",
                    due: new Date("2025-02-08T12:54:08.000Z"),
                    deckName: "Polish",
                    timezone: "America/New_York",
                },
            ],
            pagination: { page: 2, pageSize: 2 },
        },
    ])("given results data $data", ({ data, pagination }) => {
        test("should render all headers", () => {
            const { container } = render(<ResultsTable data={data} pagination={pagination} />);
            const headers = container.getElementsByTagName("th");

            expect(headers.length).toEqual(columns.length);
            columns.forEach((column, index) => {
                expect(headers[index]).toHaveTextContent(column.header as string);
            });
        });

        test("should render rows that are keyboard-navigable and redirect to the card page upon 'Enter' press", async () => {
            const { container } = render(<ResultsTable data={data} pagination={pagination} />);
            const rows = [...container.getElementsByTagName("tr")].slice(1); // The first <tr> element occurs in the table header and is of no relevance for this test

            expect(rows.length).toEqual(data.length);
            for (const [index, item] of data.entries()) {
                await userEvent.tab(); // Simulate keyboard navigation with Tab
                const row = rows[index];

                expect(row).toHaveFocus();

                await userEvent.keyboard("{Enter}");

                expect(mockRouterPush).toHaveBeenNthCalledWith(index + 1, `/card/${item.id}`);
            }
        });

        test("should render links with corresponding card page hrefs inside each table cell for each result row", () => {
            const { container } = render(<ResultsTable data={data} pagination={pagination} />);
            const cells = container.getElementsByTagName("td");

            expect(cells.length).toEqual(data.length * columns.length);
            data.forEach((item, itemIndex) => {
                columns.forEach((column, columnIndex) => {
                    const cell = cells[itemIndex * columns.length + columnIndex];
                    const link = cell?.firstElementChild;

                    expect(link).toBeInTheDocument();
                    expect(link!.tagName).toEqual("A");
                    expect(link).toHaveAttribute("href", `/card/${item.id}`);
                });
            });
        });
    });
});
