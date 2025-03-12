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

    describe.each([{ title: "Title" }, { title: "Lorem ipsum" }, { title: "Scheduled reviews" }])(
        "given title $title",
        ({ title }) => {
            test("should forward title to 'TitledCard'", () => {
                render(<DailyReviewsCard data={[]} title={title} timezone="" />);

                expect(mockedTitledCard).toHaveBeenCalledOnceWithProps({ title });
            });
        },
    );
    describe.each([
        {
            data: [{ date: new Date("2023-05-07T04:00:00.000Z"), reviews: 1 }],
            total: 1,
            timezone: "America/New_York",
        },
        {
            data: [
                { date: new Date("2023-06-07T00:00:00.000Z"), reviews: 1 },
                { date: new Date("2023-06-08T00:00:00.000Z"), reviews: 7 },
            ],
            total: 8,
            timezone: "Etc/UTC",
        },
        {
            data: [
                { date: new Date("2023-08-15T23:00:00.000Z"), reviews: 0 },
                { date: new Date("2023-08-16T23:00:00.000Z"), reviews: 0 },
            ],
            total: 0,
            timezone: "Europe/Berlin",
        },
        {
            data: [
                { date: new Date("2024-09-22T23:00:00.000Z"), reviews: 13 },
                { date: new Date("2024-09-23T23:00:00.000Z"), reviews: 0 },
                { date: new Date("2024-09-24T23:00:00.000Z"), reviews: 5 },
            ],
            total: 18,
            timezone: "Europe/Warsaw",
        },
    ])("given review data $data and timezone $timezone", ({ data, total, timezone }) => {
        test(`should render total review label 'Total: ${total}'`, () => {
            render(<DailyReviewsCard data={data} title="" timezone="" />);
            const span = screen.queryByText(`Total: ${total}`);

            expect(span).toBeInTheDocument();
        });

        test("should forward review data to 'BarChart'", () => {
            render(<DailyReviewsCard data={data} title="" timezone="" />);

            expect(mockedBarChart).toHaveBeenCalledOnceWithProps({ data });
        });

        test("should use correct data key and tick formatter for 'XAxis'", () => {
            const expectedDataKey = "date";
            mockedXAxis.mockImplementation(
                fakeCompliantValue(
                    ({ tickFormatter }: { tickFormatter: (date: Date) => string }) => {
                        data.forEach(({ date }) => tickFormatter(date)); // Fake calls with each data date during rendering
                        return <></>;
                    },
                ),
            );

            render(<DailyReviewsCard data={[]} title="" timezone={timezone} />);

            expect(mockedXAxis).toHaveBeenCalledOnceWithProps({ dataKey: expectedDataKey });
            data.forEach(({ date }, index) => {
                expect(mockedGetLocaleDateStringConcise).toHaveBeenNthCalledWith(
                    index + 1,
                    date,
                    timezone,
                );
            });
        });

        test("should use correct label formatter for 'ChartTooltipContent'", () => {
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
        });
    });

    test("should use correct name key for 'ChartTooltipContent'", () => {
        const expectedNameKey = "reviews";

        render(<DailyReviewsCard data={[]} title="" timezone="" />);

        expect(mockedChartTooltipContent).toHaveBeenCalledOnceWithProps({
            nameKey: expectedNameKey,
        });
    });

    test("should use correct data key for 'Bar'", () => {
        const expectedDataKey = "reviews";

        render(<DailyReviewsCard data={[]} title="" timezone="" />);

        expect(mockedBar).toHaveBeenCalledOnceWithProps({ dataKey: expectedDataKey });
    });
});
