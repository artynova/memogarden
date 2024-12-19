"use server";

import { CreateDeckData, CreateDeckSchema, UpdateDeckData } from "@/lib/validation-schemas";
import { getUserIDInProtectedRoute } from "@/lib/server-utils";
import { createDeck, editDeck, isDeckAccessible, removeDeck } from "@/server/data/services/deck";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * @param data Deck creation input.
 * @return Internal ID of the newly created deck.
 */
export async function createNewDeck(data: CreateDeckData) {
    if (CreateDeckSchema.safeParse(data).error) return; // Under normal circumstances, the UI will not let the user submit a creation request for a deck with an empty name. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    const userId = await getUserIDInProtectedRoute();
    return createDeck({ userId, name: data.name });
}

export async function updateDeck(data: UpdateDeckData, id: string) {
    const userId = await getUserIDInProtectedRoute();
    if (!(await isDeckAccessible(userId, id))) return; // Under normal use, the client application will never request to update a deck the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper
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
