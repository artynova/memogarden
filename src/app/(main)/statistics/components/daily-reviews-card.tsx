"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/base/chart";
import { TitledCard } from "@/components/ui/titled-card";
import { DailyReviewsEntry } from "@/lib/statistics";

const chartConfig = {
    reviews: {
        color: "hsl(var(--chart-1))",
        label: "Reviews",
    },
} satisfies ChartConfig;

export interface DailyReviewsChartProps {
    data: DailyReviewsEntry[];
    label: string;
    retrospect?: boolean;
}

export function DailyReviewsCard({ data, label, retrospect }: DailyReviewsChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.reviews, 0);

    return (
        <TitledCard title={label}>
            <div className={"flex flex-col items-center gap-6"}>
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            interval={retrospect ? undefined : "equidistantPreserveStart"}
                            tickMargin={8}
                            minTickGap={32}
                            fontSize={16}
                            tickFormatter={(value: Date) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="reviews"
                                    labelFormatter={(_value, payload) =>
                                        new Date(
                                            (payload[0].payload as DailyReviewsEntry).date,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                />
                            }
                        />
                        <Bar dataKey={"reviews"} fill={"var(--color-reviews)"} />
                    </BarChart>
                </ChartContainer>
                <span>{`Total: ${total}`}</span>
            </div>
        </TitledCard>
    );
}
