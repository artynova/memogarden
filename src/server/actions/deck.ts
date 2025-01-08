"use server";

import { ModifyDeckData, ModifyDeckSchema } from "@/lib/validation-schemas";
import { getUserIDInProtectedRoute } from "@/lib/server-utils";
import { createDeck, editDeck, isDeckAccessible, removeDeck } from "@/server/data/services/deck";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * @param data Deck creation input.
 * @return Internal ID of the newly created deck, or `undefined` if the input data is invalid.
 */
export async function createNewDeck(data: ModifyDeckData) {
    if (ModifyDeckSchema.safeParse(data).error) return; // Under normal circumstances, the UI will not let the user submit a creation request for a deck with an empty name. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    const userId = await getUserIDInProtectedRoute();
    return createDeck({ userId, name: data.name });
}

/**
 * Updates an existing deck using the given input data.
 *
 * @param data Deck update input.
 * @param id Deck's ID.
 */
export async function updateDeck(data: ModifyDeckData, id: string) {
    if (ModifyDeckSchema.safeParse(data).error) return;
    const userId = await getUserIDInProtectedRoute();
    if (!(await isDeckAccessible(userId, id))) return; // Under normal use, the client application will never request to update a deck the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    await editDeck(id, data);
}

/**
 * Deletes an existing deck, as well as all its non-deleted cards, if the currently authenticated user has the rights
 * to do so. Otherwise, the function does nothing.
 *
 * @param id Deck's ID.
 */
export async function deleteDeck(id: string) {
    const userId = await getUserIDInProtectedRoute();
    if (!(await isDeckAccessible(userId, id))) return; // Under normal use, the client application will never request to delete a deck the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper
    await removeDeck(id);
}
