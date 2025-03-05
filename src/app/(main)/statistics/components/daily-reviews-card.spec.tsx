import { DailyReviewsCard } from "@/app/(main)/statistics/components/daily-reviews-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart";
import { TitledCard } from "@/components/titled-card";
import { getLocaleDateString, getLocaleDateStringConcise } from "@/lib/ui/generic";
import { DailyReviewsEntry } from "@/lib/utils/statistics";
import { fakeCompliantValue } from "@/test/mock/generic";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/titled-card");
vi.mock("@/components/shadcn/chart", async (importOriginal) => {
    const original: object = await importOriginal();
    return {
        ...original,
        ChartContainer: vi.fn(),
        ChartTooltip: vi.fn(),
        ChartTooltipContent: vi.fn(),
    };
});
vi.mock("recharts", async (importOriginal) => {
    const original: object = await importOriginal();

    return {
        ...original,
        BarChart: vi.fn(),
        XAxis: vi.fn(),
        Bar: vi.fn(),
    };
});
vi.mock("@/lib/ui/generic");

const mockedTitledCard = vi.mocked(TitledCard);
const mockedChartContainer = vi.mocked(ChartContainer);
const mockedBarChart = vi.mocked(BarChart);
const mockedXAxis = vi.mocked(XAxis);
const mockedGetLocaleDateStringConcise = vi.mocked(getLocaleDateStringConcise);
const mockedChartTooltip = vi.mocked(ChartTooltip);
const mockedChartTooltipContent = vi.mocked(ChartTooltipContent);
const mockedGetLocaleDateString = vi.mocked(getLocaleDateString);
const mockedBar = vi.mocked(Bar);

describe(DailyReviewsCard, () => {
    beforeEach(() => {
        replaceWithChildren(fakeCompliantValue(mockedTitledCard));
        replaceWithChildren(fakeCompliantValue(mockedChartContainer));
        replaceWithChildren(mockedBarChart);
        // ChartTooltip's content is passed via the special content property instead of children, so replacing the component with the content (to get the content to render) is more complicated than for other components
        mockedChartTooltip.mockImplementation(
            fakeCompliantValue((props: { content: ReactElement | (() => ReactNode) }) => {
                if (typeof props.content === "function") return <props.content />;
                return <>{props.content}</>;
            }),
        );
    });

    test.each([{ title: "Title" }, { title: "Lorem ipsum" }, { title: "Scheduled reviews" }])(
        "should pass title $title to 'TitledCard'",
        ({ title }) => {
            render(<DailyReviewsCard data={[]} title={title} timezone="" />);

            expect(mockedTitledCard).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ title }),
                {},
            );
        },
    );

    test.each([
        { data: [{ reviews: 16 }], total: 16 },
        { data: [{ reviews: 16 }, { reviews: 2 }], total: 18 },
        { data: [{ reviews: 7 }, { reviews: 3 }, { reviews: 6 }, { reviews: 0 }], total: 16 },
    ])(
        "should render total review label 'Total: $total' given review data $data",
        ({ data, total }) => {
            render(<DailyReviewsCard data={fakeCompliantValue(data)} title="" timezone="" />);
            const span = screen.queryByText(`Total: ${total}`);

            expect(span).toBeInTheDocument();
        },
    );

    test.each([
        {
            data: [{ date: new Date("2023-05-07T04:00:00.000Z"), reviews: 1 }],
        },
        {
            data: [
                { date: new Date("2023-06-07T04:00:00.000Z"), reviews: 1 },
                { date: new Date("2023-06-08T04:00:00.000Z"), reviews: 7 },
            ],
        },
    ])("should pass data $data to the 'BarChart' component", ({ data }) => {
        render(<DailyReviewsCard data={data} title="" timezone="" />);

        expect(mockedBarChart).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                data,
            }),
            {},
        );
    });

    test.each([
        {
            data: [{ date: new Date("2023-05-07T04:00:00.000Z"), reviews: 1 }],
            timezone: "America/New_York",
        },
        {
            data: [
                { date: new Date("2023-08-07T00:00:00.000Z"), reviews: 1 },
                { date: new Date("2023-08-08T00:00:00.000Z"), reviews: 7 },
            ],
            timezone: "Etc/UTC",
        },
    ])(
        "should use correct data key and tick formatter for the X axis given data $data and timezone $timezone",
        ({ data, timezone }) => {
            const expectedDataKey = "date";
            mockedXAxis.mockImplementation(
                fakeCompliantValue(
                    ({ tickFormatter }: { tickFormatter: (date: Date) => string }) => {
                        data.forEach(({ date }) => tickFormatter(date)); // Fake calls with each data date during rendering
                        return <></>;
                    },
                ),
            );

            render(<DailyReviewsCard data={data} title="" timezone={timezone} />);

            expect(mockedXAxis).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ dataKey: expectedDataKey }),
                {},
            );
            data.forEach(({ date }, index) => {
                expect(mockedGetLocaleDateStringConcise).toHaveBeenNthCalledWith(
                    index + 1,
                    date,
                    timezone,
                );
            });
        },
    );

    test.each([
        {
            data: [{ date: new Date("2023-06-09T04:00:00.000Z"), reviews: 5 }],
            timezone: "America/New_York",
        },
        {
            data: [
                { date: new Date("2023-08-15T00:00:00.000Z"), reviews: 5 },
                { date: new Date("2023-08-16T00:00:00.000Z"), reviews: 13 },
            ],
            timezone: "Etc/UTC",
        },
    ])(
        "should use correct name key and label formatter in chart tooltip content given data $data and timezone $timezone",
        ({ data, timezone }) => {
            mockedChartTooltipContent.mockImplementation(
                fakeCompliantValue(
                    ({
                        labelFormatter,
                    }: {
                        labelFormatter: (
                            value: unknown,
                            payload: [{ payload: DailyReviewsEntry }],
                        ) => string;
                    }) => {
                        data.forEach((data) => labelFormatter(null, [{ payload: data }])); // Fake calls with each data date during rendering
                        return <></>;
                    },
                ),
            );

            render(<DailyReviewsCard data={data} title="" timezone={timezone} />);

            data.forEach(({ date }, index) => {
                expect(mockedGetLocaleDateString).toHaveBeenNthCalledWith(
                    index + 1,
                    date,
                    timezone,
                );
            });
        },
    );

    test("should use correct data key for the bars", () => {
        const expectedDataKey = "reviews";

        render(<DailyReviewsCard data={[]} title="" timezone="" />);

        expect(mockedBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ dataKey: expectedDataKey }),
            {},
        );
    });
});
