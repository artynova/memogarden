import { getSyncedUserInProtectedRoute } from "@/lib/server-utils";
import { isDeckAccessible } from "@/server/data/services/deck";
import { notFound, redirect } from "next/navigation";
import { getNextCard } from "@/server/data/services/card";
import { RevisePage } from "@/app/deck/[id]/revise/components/revise-page";
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
    const card = await getNextCard(id, getUserDayEnd(user, now));

    if (card === null) redirect(`/deck/${id}`); // Redirect to the base deck page when no cards are available for revision

    return <RevisePage user={user} card={card} />;
}
