import { PageWithSearchParamsProps, parseStringParam } from "@/lib/utils/server";
import { PageTemplate } from "@/components/page/template/page-template";
import {
    countCards,
    countCardsByMaturities,
    countReviews,
    getSparsePrediction,
    getSparseRetrospection,
    SelectUser,
} from "@/server/data/services/user";

import { getFutureRevisionsDates, getPastRevisionsDates } from "@/lib/utils/statistics";
import { getDeck, getDeckOptions, isDeckAccessible } from "@/server/data/services/deck";
import { notFound } from "next/navigation";
import { StatisticsDeckSelect } from "@/app/(main)/statistics/components/statistics-deck-select";
import { getTrimmedText } from "@/lib/utils/generic";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { CardsMaturitiesCard } from "@/app/(main)/statistics/components/cards-maturities-card";
import { DailyReviewsCard } from "@/app/(main)/statistics/components/daily-reviews-card";

import { getUserOrRedirectSC } from "@/server/auth";

const MAX_DECK_NAME_LENGTH = 30;

/**
 * Account statistics page.
 *
 * Valid search parameters:
 * - `deckId`: ID of the target deck (or nothing to enable collection-wide search).
 *
 * @param props Component properties.
 * @param props.searchParams Search parameters.
 * @returns The component.
 */
export default async function Page({ searchParams }: PageWithSearchParamsProps) {
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
        <PageTemplate title={"Statistics"} user={user}>
            <ContentWrapper>
                <div className={"flex items-center justify-between gap-6 p-3"}>
                    <StatisticsDeckSelect deckId={deckId} deckOptions={deckOptions} />
                    <div className={"flex justify-end gap-6"}>
                        <span>{`Cards: ${await countCards(user.id, deckId)}`}</span>
                        <span>{`Reviews: ${await countReviews(user.id, deckId)}`}</span>
                    </div>
                </div>
                {await getHealthBar(user, deckId)}
                <CardsMaturitiesCard data={maturityCounts} />
                <DailyReviewsCard title={"Recent reviews"} data={retrospectionStats} retrospect />
                <DailyReviewsCard title={"Scheduled reviews"} data={predictionStats} />
            </ContentWrapper>
        </PageTemplate>
    );
}

/**
 * Creates the health bar element according to the current deck filter settings.
 *
 * @param user User data.
 * @param deckId Deck ID (or `null` if none is selected).
 * @returns The component.
 */
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
