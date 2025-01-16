import { notFound } from "next/navigation";
import { getDeckOptions, getDeckPreview, isDeckAccessible } from "@/server/data/services/deck";
import { getSyncedUserInProtectedRoute } from "@/lib/server-utils";
import { DeckPage } from "@/app/deck/[id]/components/deck-page";
import { getUserDayEnd } from "@/lib/utils";

export interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const user = await getSyncedUserInProtectedRoute();
    const accessible = await isDeckAccessible(user.id, id);
    if (!accessible) notFound(); // The deck is only accessible if it both exists and belongs to the user, i.e., an inaccessible deck may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const now = new Date();
    const preview = (await getDeckPreview(id, getUserDayEnd(user, now)))!; // The isDeckAccessible check also verifies that the deck exists and is non-deleted, and getDeckPreview only returns null for invalid deck IDs, so it is guaranteed to return non-null here

    const deckOptions = await getDeckOptions(user.id);

    return <DeckPage user={user} preview={preview} deckOptions={deckOptions} />;
}
