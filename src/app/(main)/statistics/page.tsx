import { parseStringParam, SearchParam } from "@/lib/server-utils";
import { PageTemplate } from "@/components/ui/page/template/page-template";
import {
    countCards,
    countCardsByMaturities,
    countReviews,
    getSparsePrediction,
    getSparseRetrospection,
    SelectUser,
} from "@/server/data/services/user";
import { DateTime } from "luxon";

import { getCalendarDate, PREDICTION_LIMIT, RETROSPECTION_LIMIT } from "@/lib/statistics";
import { getDeck, getDeckOptions, isDeckAccessible } from "@/server/data/services/deck";
import { notFound } from "next/navigation";
import { StatisticsDeckSelect } from "@/app/(main)/statistics/components/statistics-deck-select";
import { getTrimmedText } from "@/lib/utils";
import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { CardsMaturitiesCard } from "@/app/(main)/statistics/components/cards-maturities-card";
import { DailyReviewsCard } from "@/app/(main)/statistics/components/daily-reviews-card";

import { getUserOrRedirectSC } from "@/server/auth";

/**
 * Generates an array of date-to-review-count entries starting in the past and ending at the given date in the specified
 * IANA timezone. Dates not present in the mapping are assumed to have a review count of 0. The number of dates is
 * determined by the {@link RETROSPECTION_LIMIT}.
 *
 * @param timezone The IANA timezone string (e.g., "America/New_York").
 * @param date Desired date.
 * @param datesToReviews Mapping of dates to review counts.
 *
 * @return List of date entries, with each entry containing the date and the number of reviews on it.
 */
function getPastRevisionsDates(
    timezone: string,
    date: Date,
    datesToReviews: Record<string, number>,
) {
    const todayInTimezone = DateTime.fromJSDate(date).setZone(timezone).startOf("day");
    return Array.from({ length: RETROSPECTION_LIMIT }, (_, i) => {
        const date = todayInTimezone.minus({ days: RETROSPECTION_LIMIT - 1 - i }).toJSDate();
        return { date, reviews: datesToReviews[getCalendarDate(date)] ?? 0 }; // Assume 0 revisions if data for a date is not present
    });
}

/**
 * Generates an array of date-to-review-count entries starting at the given date and ending in the future in the
 * specified IANA timezone. Dates not present in the mapping are assumed to have a review count of 0. The number of
 * dates is determined by the {@link PREDICTION_LIMIT}.
 *
 * @param timezone The IANA timezone string (e.g., "America/New_York").
 * @param date Desired date.
 * @param datesToReviews Mapping of dates to review counts.
 *
 * @return List of date entries, with each entry containing the date and the number of reviews on it.
 */
function getFutureRevisionsDates(
    timezone: string,
    date: Date,
    datesToReviews: Record<string, number>,
) {
    const todayInTimezone = DateTime.fromJSDate(date).setZone(timezone).startOf("day");
    return Array.from({ length: PREDICTION_LIMIT }, (_, i) => {
        const date = todayInTimezone.plus({ days: i }).toJSDate();
        return { date, reviews: datesToReviews[getCalendarDate(date)] ?? 0 }; // Assume 0 revisions if data for a date is not present
    });
}

export interface PageProps {
    searchParams: Promise<{ [key: string]: SearchParam }>;
}

const MAX_DECK_NAME_LENGTH = 30;

export default async function Page({ searchParams }: PageProps) {
    const user = await getUserOrRedirectSC();

    const { deckId: deckIdRaw } = await searchParams;
    const deckId = parseStringParam(deckIdRaw);
    if (deckId && !(await isDeckAccessible(user.id, deckId))) notFound();

    const deckOptions = await getDeckOptions(user.id);

    const now = new Date();
    const retrospectionStats = getPastRevisionsDates(
        user.timezone,
        now,
        await getSparseRetrospection(user.id, new Date(), deckId),
    );
    const predictionStats = getFutureRevisionsDates(
        user.timezone,
        now,
        await getSparsePrediction(user.id, new Date(), deckId),
    );

    const maturityCounts = await countCardsByMaturities(user.id, deckId);

    return (
        <PageTemplate title={"Statistics"} user={user} footerActions={[]}>
            <ContentWrapper>
                <div className={"flex items-center justify-between gap-6 p-3"}>
                    <StatisticsDeckSelect deckId={deckId} deckOptions={deckOptions} />
                    <div className={"flex justify-end gap-6"}>
                        <span>{`Cards: ${await countCards(user.id, deckId)}`}</span>
                        <span>{`Reviews: ${await countReviews(user.id, deckId)}`}</span>
                    </div>
                </div>
                {await getHealthBar(user, deckId)}
                <CardsMaturitiesCard maturityCounts={maturityCounts} />
                <DailyReviewsCard label={"Recent reviews"} data={retrospectionStats} retrospect />
                <DailyReviewsCard label={"Scheduled reviews"} data={predictionStats} />
            </ContentWrapper>
        </PageTemplate>
    );
}

async function getHealthBar(user: SelectUser, deckId: string | null) {
    if (deckId === null) {
        return <HealthBar retrievability={user.retrievability} label={"All decks"} withText />;
    }
    const deck = (await getDeck(deckId))!;
    return (
        <HealthBar
            retrievability={deck.retrievability}
            label={getTrimmedText(deck.name, MAX_DECK_NAME_LENGTH)}
            withText
        />
    );
}
