import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { getSyncedUserInProtectedRoute } from "@/lib/server-utils";
import { HomePage } from "@/app/home/components/home-page";
import { getUserDayEnd } from "@/lib/utils";

export default async function Page() {
    const user = await getSyncedUserInProtectedRoute();
    const now = new Date();
    const summary = await getAllRemaining(user.id, getUserDayEnd(user, now));
    const decks = await getDecksPreview(user.id, getUserDayEnd(user, now));
    return <HomePage user={user} summary={summary} decks={decks} />;
}
