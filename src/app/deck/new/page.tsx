import { NewDeckPage } from "@/app/deck/new/components/new-deck-page";
import { getUserDataInProtectedRoute } from "@/lib/server-utils";

export default async function Page() {
    const user = await getUserDataInProtectedRoute();
    return <NewDeckPage user={user} />;
}
