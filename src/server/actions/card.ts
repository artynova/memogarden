"use server";

import { ModifyCardData, ModifyCardSchema } from "@/lib/validation-schemas";
import { getUserIDInProtectedRoute } from "@/lib/server-utils";
import { isDeckAccessible } from "@/server/data/services/deck";
import { ResponseNotFound } from "@/lib/responses";
import { createCard, editCard, isCardAccessible } from "@/server/data/services/card";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * @param data Deck creation input.
 * @return Internal ID of the newly created card, or a "not found" error response if the deck is not found among user's
 * valid decks, or `undefined` if the input data is otherwise invalid.
 */
export async function createNewCard(data: ModifyCardData) {
    if (ModifyCardSchema.safeParse(data).error) return; // Under normal circumstances, the UI will not let the user submit a creation request for an invalid card. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    const userId = await getUserIDInProtectedRoute();
    if (!(await isDeckAccessible(userId, data.deckId))) return ResponseNotFound; // This can very rarely happen even with compliant use when the user deletes a deck on one device and then selects that deck in the card creation form on another device (which has stale data) and submits that request
    return createCard(data);
}

/**
 * Updates an existing card using the given input data.
 *
 * @param data Card update input.
 * @param id Card's ID.
 */
export async function updateCard(data: ModifyCardData, id: string) {
    if (ModifyCardSchema.safeParse(data).error) return;
    const userId = await getUserIDInProtectedRoute();
    if (!(await isCardAccessible(userId, id))) return; // Under normal use, the client application will never request to update a card the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    await editCard(id, data);
}
