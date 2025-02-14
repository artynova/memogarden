"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/shadcn/chart";
import { TitledCard } from "@/components/titled-card";
import { DailyReviewsEntry } from "@/lib/utils/statistics";

const chartConfig = {
    reviews: {
        color: "hsl(var(--chart-1))",
        label: "Reviews",
    },
} satisfies ChartConfig;

/**
 * UI card with a vertical bar chart showing numbers of reviews for specific dates.
 *
 * @param props Component properties.
 * @param props.data Chart data.
 * @param props.title Card title.
 * @param props.retrospect Whether the chart starts in some moment in the past and ends on the current date. If true,
 * the chart will prioritize showing a date label for the rightmost date. If false or unspecified, the chart will
 * prioritize showing a label for the leftmost date instead (since that date will be considered the current date).
 * @returns The component.
 */
export function DailyReviewsCard({
    data,
    title,
    retrospect,
}: {
    data: DailyReviewsEntry[];
    title: string;
    retrospect?: boolean;
}) {
    const total = data.reduce((acc, curr) => acc + curr.reviews, 0);

    return (
        <TitledCard title={title}>
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
