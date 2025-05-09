"use server";

import { ModifyCardData, ModifyCardSchema } from "@/server/actions/card/schemas";
import { isDeckAccessible } from "@/server/data/services/deck";
import { ResponseBadRequest, ResponseNotFound } from "@/lib/responses";
import {
    createCard,
    editCard,
    isCardAccessible,
    removeCard,
    reviewCard,
} from "@/server/data/services/card";
import { getUserIdOrRedirect, getUserOrRedirect } from "@/lib/utils/server";
import { getDayEnd } from "@/lib/utils/generic";

import { ReviewRating } from "@/lib/enums";

/**
 * Creates a new deck using the given input data and assigns it to the currently logged-in user.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param data Deck creation input.
 * @returns Error response if there are any problems. Internal ID of the newly created card otherwise.
 */
export async function createNewCard(data: ModifyCardData) {
    if (ModifyCardSchema.safeParse(data).error) return ResponseBadRequest;
    const userId = await getUserIdOrRedirect();
    if (!(await isDeckAccessible(userId, data.deckId))) return ResponseNotFound; // This can very rarely happen even with compliant use when the user deletes a deck on one device and then selects that deck in the card creation form on another device (which has stale data) and submits that request
    return createCard(data);
}

/**
 * Updates an existing card using the given input data.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param data Card update input.
 * @param id Card's ID.
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function updateCard(data: ModifyCardData, id: string) {
    if (ModifyCardSchema.safeParse(data).error) return ResponseBadRequest;
    const userId = await getUserIdOrRedirect();
    if (!(await isCardAccessible(userId, id)) || !(await isDeckAccessible(userId, data.deckId))) {
        return ResponseNotFound;
    }
    return editCard(id, data);
}

/**
 * Deletes an existing card if the currently authenticated user has the rights
 * to do so. Otherwise, the function does nothing.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param id Card's ID.
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function deleteCard(id: string) {
    const userId = await getUserIdOrRedirect();
    if (!(await isCardAccessible(userId, id))) return ResponseNotFound;
    return removeCard(id);
}

/**
 * Updates SRS metadata of a card based on a review with a given rating at the current timestamp if the user has the
 * rights to review the card. Otherwise, the function does nothing.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param id Card's ID.
 * @param answer User's attempted answer (will be recorded as part of the review log).
 * @param rating Review ease rating given by the user.
 * @returns Error response if there are any problems. Information about whether the review session is finished (i.e.,
 * whether there are no due cards remaining) otherwise.
 */
export async function reviewCardWithRating(id: string, answer: string, rating: ReviewRating) {
    const user = await getUserOrRedirect();
    if (!(await isCardAccessible(user.id, id))) return ResponseNotFound;
    const now = new Date();
    return reviewCard(id, answer, now, getDayEnd(now, user.timezone!), rating);
}
