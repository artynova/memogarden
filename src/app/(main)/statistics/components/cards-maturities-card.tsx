"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/shadcn/chart";
import { cardMaturities } from "@/lib/ui/maturity";
import * as React from "react";
import { TitledCard } from "@/components/titled-card";
import { MaturityCountsEntry } from "@/lib/utils/statistics";

import { CardMaturity } from "@/lib/enums";

const chartConfig = {
    cards: {
        color: "hsl(var(--chart-1))",
        label: "Cards",
    },
    label: {
        color: "hsl(var(--foreground))",
    },
} satisfies ChartConfig;

/**
 * UI card with a horizontal flashcard maturity counts bar chart.
 *
 * @param props Component properties.
 * @param props.data Chart data.
 * @returns The component.
 */
export function CardsMaturitiesCard({ data }: { data: MaturityCountsEntry[] }) {
    return (
        <TitledCard title="Card maturities">
            <ChartContainer config={chartConfig} className="max-h-[300px] min-h-[100px] w-full">
                <BarChart
                    accessibilityLayer
                    data={data}
                    layout="vertical"
                    margin={{
                        left: 72,
                        right: 24,
                    }}
                >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                        dataKey="maturity"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        hide
                    />
                    <XAxis dataKey="cards" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                indicator="line"
                                labelFormatter={(_value, payload) => {
                                    return cardMaturities[
                                        (payload[0].payload as MaturityCountsEntry).maturity
                                    ].name;
                                }}
                            />
                        }
                    />
                    <Bar dataKey="cards" layout="vertical" fill="var(--color-cards)" radius={4}>
                        <LabelList
                            dataKey="maturity"
                            position="left"
                            offset={8}
                            fontSize={16}
                            className="fill-[--color-label]"
                            formatter={(value: CardMaturity) => cardMaturities[value].name}
                        />
                        <LabelList
                            dataKey="cards"
                            position="right"
                            offset={8}
                            fontSize={16}
                            className="fill-[--color-label]"
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>
        </TitledCard>
    );
}
