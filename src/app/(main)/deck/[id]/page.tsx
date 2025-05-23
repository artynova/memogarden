import { notFound } from "next/navigation";
import { getDeckOptions, getDeckPreview, isDeckAccessible } from "@/server/data/services/deck";
import { DeckPage } from "@/app/(main)/deck/[id]/components/deck-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";
import { getDayEnd } from "@/lib/utils/generic";
import { ResourceSpecificPageProps } from "@/lib/utils/server";

/**
 * Individual deck page.
 *
 * @param props Component properties.
 * @param props.params Path parameters with the "id" parameter.
 * @returns The component.
 */
export default async function Page({ params }: ResourceSpecificPageProps) {
    const { id } = await params;
    const user = await getUserOrRedirectSC();
    if (!(await isDeckAccessible(user.id, id))) notFound(); // The deck is only accessible if it both exists and belongs to the user, i.e., an inaccessible deck may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const now = new Date();
    const preview = (await getDeckPreview(id, getDayEnd(now, user.timezone!)))!; // The isDeckAccessible check also verifies that the deck exists and is non-deleted, and getDeckPreview only returns null for invalid deck IDs, so it is guaranteed to return non-null here

    const deckOptions = await getDeckOptions(user.id);

    return <DeckPage user={user} preview={preview} deckOptions={deckOptions} />;
}
