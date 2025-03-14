"use server";

import { createDeck, editDeck, isDeckAccessible, removeDeck } from "@/server/data/services/deck";

import { getUserIdOrRedirect } from "@/lib/utils/server";
import { ResponseBadRequest, ResponseNotFound } from "@/lib/responses";
import { ModifyDeckData, ModifyDeckSchema } from "@/server/actions/deck/schemas";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param data Deck creation input.
 * @returns Error response if there are any problems. Internal ID of the newly created deck otherwise.
 */
export async function createNewDeck(data: ModifyDeckData) {
    if (ModifyDeckSchema.safeParse(data).error) return ResponseBadRequest;
    const userId = await getUserIdOrRedirect();
    return createDeck({ userId, name: data.name });
}

/**
 * Updates an existing deck using the given input data.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param data Deck update input.
 * @param id Deck's ID.
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function updateDeck(data: ModifyDeckData, id: string) {
    if (ModifyDeckSchema.safeParse(data).error) return ResponseBadRequest;
    const userId = await getUserIdOrRedirect();
    if (!(await isDeckAccessible(userId, id))) return ResponseNotFound;
    return editDeck(id, data);
}

/**
 * Deletes an existing deck, as well as all its non-deleted cards, if the currently authenticated user has the rights
 * to do so. Otherwise, the function does nothing.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param id Deck's ID.
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function deleteDeck(id: string) {
    const userId = await getUserIdOrRedirect();
    if (!(await isDeckAccessible(userId, id))) return ResponseNotFound;
    return removeDeck(id);
}
