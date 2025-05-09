import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { HomePage } from "@/app/(main)/home/components/home-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";
import { getDayEnd } from "@/lib/utils/generic";
import { MissingTimezoneHandler } from "@/app/(main)/home/components/missing-timezone-handler";
import { Suspense } from "react";

/**
 * App home page with a dashboard showing an overview of the user's card collection.
 *
 * @returns The component.
 */
export default async function Page() {
    const user = await getUserOrRedirectSC();

    const now = new Date();
    // Using the generic UTC when the timezone is missing is acceptable here because the actual timezone may only be unknown upon the first visit to the homepage (only in OAuth accounts), when there are no actual flashcards or decks to summarize yet
    const summary = await getAllRemaining(user.id, getDayEnd(now, user.timezone ?? "UTC"));
    const decks = await getDecksPreview(user.id, getDayEnd(now, user.timezone ?? "UTC"));
    return (
        <>
            <Suspense>
                <MissingTimezoneHandler user={user} />
            </Suspense>
            <HomePage user={user} summary={summary} decks={decks} />;
        </>
    );
}
