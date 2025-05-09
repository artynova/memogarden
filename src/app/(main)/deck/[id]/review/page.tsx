import { isDeckAccessible } from "@/server/data/services/deck";
import { notFound, redirect } from "next/navigation";
import { getNextCard } from "@/server/data/services/card";
import { ReviewPage } from "@/app/(main)/deck/[id]/review/components/review-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";
import { getDayEnd } from "@/lib/utils/generic";
import { ResourceSpecificPageProps } from "@/lib/utils/server";

/**
 * Deck review page.
 *
 * @param props Component properties.
 * @param props.params Path parameters with the "id" parameter.
 * @returns The component.
 */
export default async function Page({ params }: ResourceSpecificPageProps) {
    const { id } = await params;
    const user = await getUserOrRedirectSC();
    const accessible = await isDeckAccessible(user.id, id);
    if (!accessible) notFound(); // The deck is only accessible if it both exists and belongs to the user, i.e., an inaccessible deck may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const now = new Date();
    const card = await getNextCard(id, getDayEnd(now, user.timezone!));

    if (card === null) return redirect(`/deck/${id}`); // Redirect to the base deck page when no cards are available for revision
    return <ReviewPage key={card.id} user={user} card={card} />;
}
