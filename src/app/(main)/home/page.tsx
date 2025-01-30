import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { getUserDayEnd } from "@/lib/server-utils";
import { HomePage } from "@/app/(main)/home/components/home-page";

import { getUserOrRedirectSC } from "@/server/auth";

export default async function Page() {
    const user = await getUserOrRedirectSC();
    const now = new Date();
    const summary = await getAllRemaining(user.id, getUserDayEnd(user, now));
    const decks = await getDecksPreview(user.id, getUserDayEnd(user, now));
    return <HomePage user={user} summary={summary} decks={decks} />;
}
