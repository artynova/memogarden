import { CardsMaturitiesCard } from "@/app/(main)/statistics/components/cards-maturities-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart";
import { TitledCard } from "@/components/titled-card";
import { CardMaturity } from "@/lib/enums";
import { MaturityCountsEntry } from "@/lib/utils/statistics";
import { fakeCompliantValue } from "@/test/mock/generic";
import { replaceWithChildren } from "@/test/mock/react";
import { render } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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
        YAxis: vi.fn(),
        Bar: vi.fn(),
        LabelList: vi.fn(),
    };
});

const mockedTitledCard = vi.mocked(TitledCard);
const mockedChartContainer = vi.mocked(ChartContainer);
const mockedBarChart = vi.mocked(BarChart);
const mockedYAxis = vi.mocked(YAxis);
const mockedXAxis = vi.mocked(XAxis);
const mockedChartTooltip = vi.mocked(ChartTooltip);
const mockedChartTooltipContent = vi.mocked(ChartTooltipContent);
const mockedBar = vi.mocked(Bar);
const mockedLabelList = vi.mocked(LabelList);

describe(CardsMaturitiesCard, () => {
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
        replaceWithChildren(fakeCompliantValue(mockedBar));
    });

    describe.each([
        {
            data: [
                { maturity: CardMaturity.Seed, cards: 0 },
                { maturity: CardMaturity.Sprout, cards: 0 },
                { maturity: CardMaturity.Sapling, cards: 0 },
                { maturity: CardMaturity.Budding, cards: 0 },
                { maturity: CardMaturity.Mature, cards: 0 },
                { maturity: CardMaturity.Mighty, cards: 0 },
            ],
        },
        {
            data: [
                { maturity: CardMaturity.Seed, cards: 0 },
                { maturity: CardMaturity.Sprout, cards: 1 },
                { maturity: CardMaturity.Sapling, cards: 15 },
                { maturity: CardMaturity.Budding, cards: 0 },
                { maturity: CardMaturity.Mature, cards: 3 },
                { maturity: CardMaturity.Mighty, cards: 0 },
            ],
        },
        {
            data: [
                { maturity: CardMaturity.Seed, cards: 17 },
                { maturity: CardMaturity.Sprout, cards: 3 },
                { maturity: CardMaturity.Sapling, cards: 33 },
                { maturity: CardMaturity.Budding, cards: 54 },
                { maturity: CardMaturity.Mature, cards: 3 },
                { maturity: CardMaturity.Mighty, cards: 21 },
            ],
        },
    ])("given maturity counts data $data", ({ data }) => {
        test("should forward data to 'BarChart'", () => {
            render(<CardsMaturitiesCard data={data} />);

            expect(mockedBarChart).toHaveBeenCalledOnceWithProps({ data });
        });

        test("should use correct label formatter for 'ChartTooltipContent'", () => {
            const collectedOutputs: string[] = [];
            mockedChartTooltipContent.mockImplementation(
                fakeCompliantValue(
                    ({
                        labelFormatter,
                    }: {
                        labelFormatter: (
                            value: unknown,
                            payload: [{ payload: MaturityCountsEntry }],
                        ) => string;
                    }) => {
                        data.forEach((data) =>
                            collectedOutputs.push(labelFormatter(null, [{ payload: data }])),
                        ); // Fake calls with each maturity during rendering and collect outputs
                        return <></>;
                    },
                ),
            );

            render(<CardsMaturitiesCard data={[]} />);

            data.forEach(({ maturity }, index) => {
                expect(collectedOutputs[index]).toEqual(CardMaturity[maturity]);
            });
        });

        test("should use correct formatter for maturity 'LabelList'", () => {
            const collectedOutputs: string[] = [];
            mockedLabelList.mockImplementation(
                fakeCompliantValue(
                    ({ formatter }: { formatter?: (value: CardMaturity) => string }) => {
                        if (formatter) {
                            data.forEach(({ maturity }) =>
                                collectedOutputs.push(formatter(maturity)),
                            ); // Fake calls with each maturity during rendering and collect outputs
                        }
                        return <></>;
                    },
                ),
            );

            render(<CardsMaturitiesCard data={[]} />);

            data.forEach(({ maturity }, index) => {
                expect(collectedOutputs[index]).toEqual(CardMaturity[maturity]);
            });
        });
    });

    test("should use correct data key and type for 'YAxis'", () => {
        const expectedProps = { dataKey: "maturity", type: "category" };

        render(<CardsMaturitiesCard data={[]} />);

        expect(mockedYAxis).toHaveBeenCalledOnceWithProps(expectedProps);
    });

    test("should use correct data key and type for 'XAxis'", () => {
        const expectedProps = { dataKey: "cards", type: "number" };

        render(<CardsMaturitiesCard data={[]} />);

        expect(mockedXAxis).toHaveBeenCalledOnceWithProps(expectedProps);
    });

    test("should use correct data key for 'Bar'", () => {
        const expectedDataKey = "cards";

        render(<CardsMaturitiesCard data={[]} />);

        expect(mockedBar).toHaveBeenCalledOnceWithProps({ dataKey: expectedDataKey });
    });

    test("should use correct data key for maturity 'LabelList'", () => {
        const expectedDataKey = "maturity";

        render(<CardsMaturitiesCard data={[]} />);

        expect(mockedLabelList).toHaveBeenCalledTimes(2);
        expect(mockedLabelList).toHaveBeenCalledWithProps({ dataKey: expectedDataKey });
    });

    test("should use correct data key for card count 'LabelList'", () => {
        const expectedDataKey = "cards";

        render(<CardsMaturitiesCard data={[]} />);

        expect(mockedLabelList).toHaveBeenCalledTimes(2);
        expect(mockedLabelList).toHaveBeenCalledWithProps({ dataKey: expectedDataKey });
    });
});
