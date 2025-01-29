import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { getUserOrRedirectSC, getUserDayEnd } from "@/lib/server-utils";
import { HomePage } from "@/app/home/components/home-page";

export default async function Page() {
    const user = await getUserOrRedirectSC();
    const now = new Date();
    const summary = await getAllRemaining(user.id, getUserDayEnd(user, now));
    const decks = await getDecksPreview(user.id, getUserDayEnd(user, now));
    return <HomePage user={user} summary={summary} decks={decks} />;
}
