"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/base/chart";
import { cardMaturities, CardMaturity } from "@/lib/spaced-repetition";
import * as React from "react";
import { TitledCard } from "@/components/ui/titled-card";
import { MaturityCountsEntry } from "@/lib/statistics";

const chartConfig = {
    count: {
        color: "hsl(var(--chart-1))",
        label: "Cards",
    },
    label: {
        color: "hsl(var(--foreground))",
    },
} satisfies ChartConfig;

export interface CardsMaturitiesChartProps {
    maturityCounts: MaturityCountsEntry[];
}

export function CardsMaturitiesCard({ maturityCounts }: CardsMaturitiesChartProps) {
    return (
        <TitledCard title={"Card maturities"}>
            <ChartContainer config={chartConfig} className={"max-h-[300px] min-h-[100px] w-full"}>
                <BarChart
                    accessibilityLayer
                    data={maturityCounts}
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
                    <XAxis dataKey="count" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                indicator="line"
                                nameKey="count"
                                labelFormatter={(value: CardMaturity) => cardMaturities[value].name}
                            />
                        }
                    />
                    <Bar dataKey="count" layout="vertical" fill="var(--color-count)" radius={4}>
                        <LabelList
                            dataKey="maturity"
                            position="left"
                            offset={8}
                            fontSize={16}
                            className="fill-[--color-label]"
                            formatter={(value: CardMaturity) => cardMaturities[value].name}
                        />
                        <LabelList
                            dataKey="count"
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
