"use server";

import { getUserIdOrRedirect, getUserOrRedirect, signIn, signOut } from "@/server/auth";
import { REDIRECT_WITH_AUTH_TO, REDIRECT_WITHOUT_AUTH_TO } from "@/lib/routes";
import { ResponseBadRequest, ResponseConflict, ResponseUnauthorized } from "@/lib/responses";
import { CredentialsSignin } from "next-auth";
import {
    createCredentialsUser,
    editUser,
    getUserCredentialsByEmail,
    getUserPasswordHash,
    invalidateAllTokens,
    updateUserPassword,
} from "@/server/data/services/user";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import {
    ChangePasswordData,
    ChangePasswordSchema,
    CredentialsSigninData,
    CredentialsSigninSchema,
    CredentialsSignupData,
    CredentialsSignupSchema,
    UpdateUserData,
    UpdateUserSchema,
} from "@/server/actions/user/schemas";

/**
 * Registers a user with credentials. Only for users with credentials because OAuth users
 * do not have a separate registration flow.
 *
 * Redirects to sign-in if sign-up succeeds.
 *
 * @param data Sign-up input data.
 * @param timezone Timezone string describing the user's timezone, inferred by the client app based on settings.
 * @returns Error response if there are any problems.
 */
export async function signup(data: CredentialsSignupData, timezone: string) {
    const parsed = CredentialsSignupSchema.safeParse(data);
    if (parsed.error) return ResponseBadRequest;
    const { email, password } = parsed.data;
    const existingCredentials = await getUserCredentialsByEmail(email);
    if (existingCredentials) return ResponseConflict;
    await createCredentialsUser(email, password, timezone ?? "Etc/UTC"); // Default to UTC in unexpected cases
    return redirect("/signin");
}

/**
 * Validates a user's credentials input and signs them in if the credentials are correct.
 *
 * Redirects to app home if sign-in succeeds.
 *
 * @param data Sign-in input data.
 * @returns Error response if there are any problems.
 */
export async function signinWithCredentials(data: CredentialsSigninData) {
    const parsed = CredentialsSigninSchema.safeParse(data);
    if (parsed.error) return ResponseBadRequest;
    const { email, password } = parsed.data;
    try {
        await signIn("credentials", {
            email,
            password,
        });
    } catch (error) {
        if (error instanceof CredentialsSignin) return ResponseUnauthorized;
    }
    return redirect(REDIRECT_WITH_AUTH_TO);
}

/**
 * Initiates the OAuth sign-in process through the Google provider, redirecting to app home upon success.
 */
export async function signinWithGoogle() {
    await signIn("google", { redirectTo: REDIRECT_WITH_AUTH_TO });
}

/**
 * Initiates the OAuth sign-in process through the Facebook provider, redirecting to app home upon success.
 */
export async function signinWithFacebook() {
    await signIn("facebook", { redirectTo: REDIRECT_WITH_AUTH_TO });
}

/**
 * Signs the user out, destroying the session cookie and redirecting to sign-in afterward.
 */
export async function signout() {
    await signOut({ redirectTo: REDIRECT_WITHOUT_AUTH_TO });
}

/**
 * Changes the user's password to a new value only if the old password they input matches the current hash stored in
 * the database. Destroys all existing sessions of the user (including the current one) after the operation finishes
 * successfully.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid. Destroys the current session
 * cookie immediately and redirects to sign-in if password change succeeds.
 *
 * @param data Data required to change the password (namely, the old password - to confirm the identity once more - and
 * the new password).
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function changePassword(data: ChangePasswordData) {
    if (ChangePasswordSchema.safeParse(data).error) return ResponseBadRequest; // Can only really happen for abnormal requests
    const { oldPassword, password } = data;
    const id = await getUserIdOrRedirect();
    const oldHash = await getUserPasswordHash(id);
    if (!oldHash) return ResponseUnauthorized;
    if (!bcrypt.compareSync(oldPassword, oldHash)) return ResponseUnauthorized;
    await updateUserPassword(id, password);
    await invalidateAllTokens(id);
    return signout(); // This is technically not necessary, but it allows to destroy the freshly invalidated token immediately as opposed to waiting until the client tries to access another auth-protected page and destroying the invalid token there
}

/**
 * Destroys all sessions of the currently signed-in user, redirecting them to sign-in afterward.
 */
export async function signOutEverywhere() {
    const user = await getUserOrRedirect();
    await invalidateAllTokens(user.id);
    await signout();
}

/**
 * Updates user's profile information.
 *
 * Destroys the session cookie and redirects to sign-in if the session cookie is invalid.
 *
 * @param data Update input data.
 * @returns Error response if there are any problems. Nothing otherwise.
 */
export async function updateUser(data: UpdateUserData) {
    if (UpdateUserSchema.safeParse(data).error) return ResponseBadRequest;
    const id = await getUserIdOrRedirect();
    return editUser(id, data);
}
