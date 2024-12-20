import { getAllRemaining, getDecksPreview } from "@/server/data/services/deck";
import { getUserDataInProtectedRoute } from "@/lib/server-utils";
import { HomePage } from "@/app/home/components/home-page";

export default async function Page() {
    const user = await getUserDataInProtectedRoute();
    const now = new Date();
    const summary = await getAllRemaining(user.id, now);
    const decks = await getDecksPreview(user.id, now);
    return <HomePage user={user} summary={summary} decks={decks} />;
}
