import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { HomePage } from "@/app/(main)/home/components/home-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";
import { getDayEnd } from "@/lib/utils/generic";

/**
 * App home page with a dashboard showing an overview of the user's card collection.
 *
 * @returns The component.
 */
export default async function Page() {
    const user = await getUserOrRedirectSC();
    const now = new Date();
    const summary = await getAllRemaining(user.id, getDayEnd(now, user.timezone));
    const decks = await getDecksPreview(user.id, getDayEnd(now, user.timezone));
    return <HomePage user={user} summary={summary} decks={decks} />;
}
