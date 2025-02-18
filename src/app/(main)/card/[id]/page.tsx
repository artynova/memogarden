import { notFound } from "next/navigation";
import { getDeckOptions } from "@/server/data/services/deck";
import { getCardDataView, isCardAccessible } from "@/server/data/services/card";
import { CardPage } from "@/app/(main)/card/[id]/components/card-page";

import { getUserOrRedirectSC } from "@/lib/utils/server";
import { ResourceSpecificPageProps } from "@/lib/utils/server";

/**
 * Individual card page.
 *
 * @param props Component properties.
 * @param props.params Path parameters with the "id" parameter.
 * @returns The component.
 */
export default async function Page({ params }: ResourceSpecificPageProps) {
    const { id } = await params;
    const user = await getUserOrRedirectSC();
    const accessible = await isCardAccessible(user.id, id);
    if (!accessible) notFound(); // The card is only accessible if it both exists and belongs to the user, i.e., an inaccessible card may either not exist or belong to a different user. For security reasons, the application will not inform user about which of the two is the case, and will simply report that the resource was not found

    const preview = (await getCardDataView(id))!; // The isCardAccessible check also verifies that the deck exists and is non-deleted, and getDeckPreview only returns null for invalid deck IDs, so it is guaranteed to return non-null here
    const deckOptions = await getDeckOptions(user.id);

    return <CardPage user={user} card={preview} deckOptions={deckOptions} />;
}
