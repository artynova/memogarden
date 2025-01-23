import { CardMaturity } from "@/lib/spaced-repetition";

export type DateRevisionStats = {
    date: string;
    reviews: number;
};

export type SparseDatesReviews = Record<string, number>;

export const RETROSPECTION_LIMIT = 30;
export const PREDICTION_LIMIT = 30;

export function getCalendarDate(date: Date) {
    return date.toISOString().split("T")[0];
}

export function toSparseDatesReviews(data: DateRevisionStats[]) {
    return data.reduce<SparseDatesReviews>((acc, { date, reviews }) => {
        acc[getCalendarDate(new Date(date))] = reviews;
        return acc;
    }, {});
}

export type MaturityCountsEntry = {
    maturity: CardMaturity;
    count: number;
};

export type DailyReviewsEntry = {
    date: Date;
    reviews: number;
};
