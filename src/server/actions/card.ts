"use server";

import { ModifyCardData, ModifyCardSchema } from "@/lib/validation-schemas";
import { getUserDayEnd } from "@/lib/server-utils";
import { isDeckAccessible } from "@/server/data/services/deck";
import { ResponseNotFound } from "@/lib/responses";
import {
    createCard,
    editCard,
    isCardAccessible,
    removeCard,
    reviewCard,
} from "@/server/data/services/card";
import { ReviewRating } from "@/lib/spaced-repetition";
import { getUserIdOrRedirect, getUserOrRedirect } from "@/server/auth";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * @param data Deck creation input.
 * @return Internal ID of the newly created card, or a "not found" error response if the deck is not found among user's
 * valid decks, or `undefined` if the input data is otherwise invalid.
 */
export async function createNewCard(data: ModifyCardData) {
    if (ModifyCardSchema.safeParse(data).error) return; // Under normal circumstances, the UI will not let the user submit a creation request for an invalid card. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    const userId = await getUserIdOrRedirect();
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
    const userId = await getUserIdOrRedirect();
    if (!(await isCardAccessible(userId, id))) return; // Under normal use, the client application will never request to update a card the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    await editCard(id, data);
}

/**
 * Deletes an existing card if the currently authenticated user has the rights
 * to do so. Otherwise, the function does nothing.
 *
 * @param id Card's ID.
 */
export async function deleteCard(id: string) {
    const userId = await getUserIdOrRedirect();
    if (!(await isCardAccessible(userId, id))) return; // Under normal use, the client application will never request to delete a card the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper error reporting
    await removeCard(id);
}

/**
 * Updates SRS metadata of a card based on a review with a given rating at the current timestamp if the user has the
 * rights to review the card. Otherwise, the function does nothing.
 *
 * @param id Card's ID.
 * @param answer User's attempted answer (will be recorded as part of the review log).
 * @param rating Review ease rating given by the user.
 */
export async function reviewCardWithRating(id: string, answer: string, rating: ReviewRating) {
    const user = await getUserOrRedirect();
    if (!(await isCardAccessible(user.id, id))) return; // Under normal use, the client application will never request to revise a card the currently logged-in user does not own. Therefore, if this branch is reached, the request was constructed maliciously and does not need proper
    const now = new Date();
    await reviewCard(id, answer, now, getUserDayEnd(user, now), rating);
}
