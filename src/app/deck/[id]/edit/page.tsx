import { EditDeckPage } from "@/app/deck/[id]/edit/components/edit-deck-page";
import { getUserDataInProtectedRoute } from "@/lib/server-utils";
import { getDeck, isDeckAccessible } from "@/server/data/services/deck";
import { notFound } from "next/navigation";

export interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const user = await getUserDataInProtectedRoute();
    const accessible = await isDeckAccessible(user.id, params.id);
    if (!accessible) notFound(); // The deck is only accessible if it both exists and belongs to the user, i.e., an inaccessible deck may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const deck = (await getDeck(params.id))!; // The isDeckAccessible check also verifies that the deck exists and is non-deleted, and getDeckPreview only returns null for invalid deck IDs, so it is guaranteed to return non-null here

    return <EditDeckPage user={user} deck={deck} />;
}
