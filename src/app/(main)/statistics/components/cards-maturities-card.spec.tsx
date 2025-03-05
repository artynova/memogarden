import { CardsMaturitiesCard } from "@/app/(main)/statistics/components/cards-maturities-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn/chart";
import { TitledCard } from "@/components/titled-card";
import { CardMaturity } from "@/lib/enums";
import { MaturityCountsEntry } from "@/lib/utils/statistics";
import { stringifyWithSingleSpaces } from "@/test/display";
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
])(CardsMaturitiesCard, ({ data }) => {
    const dataString = stringifyWithSingleSpaces(data);

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

    test(`should pass data ${dataString} to the 'BarChart' component`, () => {
        render(<CardsMaturitiesCard data={data} />);

        expect(mockedBarChart).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                data,
            }),
            {},
        );
    });

    test(`should use correct data key and type for the Y axis given data ${dataString}`, () => {
        const expectedProps = { dataKey: "maturity", type: "category" };

        render(<CardsMaturitiesCard data={data} />);

        expect(mockedYAxis).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining(expectedProps),
            {},
        );
    });

    test(`should use correct data key and type for the X axis given data ${dataString}`, () => {
        const expectedProps = { dataKey: "cards", type: "number" };

        render(<CardsMaturitiesCard data={data} />);

        expect(mockedXAxis).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining(expectedProps),
            {},
        );
    });

    test(`should use correct name key and label formatter in chart tooltip content given data ${dataString}`, () => {
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

        render(<CardsMaturitiesCard data={data} />);

        data.forEach(({ maturity }, index) => {
            expect(collectedOutputs[index]).toEqual(CardMaturity[maturity]);
        });
    });

    test(`should use correct data key for 'Bar' given data ${dataString}`, () => {
        const expectedDataKey = "cards";

        render(<CardsMaturitiesCard data={data} />);

        expect(mockedBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ dataKey: expectedDataKey }),
            {},
        );
    });

    test(`should use correct data key and formatter for the maturity label list given data ${dataString}`, () => {
        const expectedDataKey = "maturity";
        const collectedOutputs: string[] = [];
        mockedLabelList.mockImplementation(
            fakeCompliantValue(({ formatter }: { formatter?: (value: CardMaturity) => string }) => {
                if (formatter) {
                    data.forEach(({ maturity }) => collectedOutputs.push(formatter(maturity))); // Fake calls with each maturity during rendering and collect outputs
                }
                return <></>;
            }),
        );

        render(<CardsMaturitiesCard data={data} />);

        expect(mockedLabelList).toHaveBeenCalledWith(
            expect.objectContaining({ dataKey: expectedDataKey }),
            {},
        );
        data.forEach(({ maturity }, index) => {
            expect(collectedOutputs[index]).toEqual(CardMaturity[maturity]);
        });
    });

    test(`should use correct data key for the card count label list given data ${dataString}`, () => {
        const expectedDataKey = "cards";

        render(<CardsMaturitiesCard data={data} />);

        expect(mockedLabelList).toHaveBeenCalledWith(
            expect.objectContaining({ dataKey: expectedDataKey }),
            {},
        );
    });
});
