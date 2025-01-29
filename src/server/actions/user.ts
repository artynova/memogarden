"use server";

import { signIn, signOut } from "@/server/auth";
import { REDIRECT_WITH_AUTH_TO, REDIRECT_WITHOUT_AUTH_TO } from "@/lib/routes";
import {
    ChangePasswordData,
    ChangePasswordSchema,
    CredentialsSigninData,
    CredentialsSignupData,
    UpdateUserData,
    UpdateUserSchema,
} from "@/lib/validation-schemas";
import { Response, ResponseConflict, ResponseOK, ResponseUnauthorized } from "@/lib/responses";
import { CredentialsSignin } from "next-auth";
import {
    createCredentialsUser,
    editUser,
    getUserCredentialsByEmail,
    getUserPasswordHash,
    updateUserPassword,
} from "@/server/data/services/user";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { getUserIdOrRedirect } from "@/lib/server-utils";

/**
 * Registers a user with credentials. Only for users with credentials because OAuth users
 * do not have a separate registration flow.
 *
 * @param formData Form data from the frontend.
 * @param timezone Timezone string describing the user's inferred timezone based on system settings.
 */
export async function signup(
    { email, password }: CredentialsSignupData,
    timezone: string,
): Promise<Response | undefined> {
    const existingCredentials = await getUserCredentialsByEmail(email);
    if (existingCredentials) return ResponseConflict;
    await createCredentialsUser(email, password, timezone ?? "Etc/UTC"); // Default to UTC in unexpected cases
    redirect("/signin");
}

export async function signinWithCredentials({
    email,
    password,
}: CredentialsSigninData): Promise<Response | undefined> {
    try {
        await signIn("credentials", {
            email,
            password,
        });
    } catch (error) {
        if (error instanceof CredentialsSignin) return ResponseUnauthorized;
    }
    redirect(REDIRECT_WITH_AUTH_TO);
}

export async function signinWithGoogle() {
    await signIn("google", { redirectTo: REDIRECT_WITH_AUTH_TO });
}

export async function signinWithFacebook() {
    await signIn("facebook", { redirectTo: REDIRECT_WITH_AUTH_TO });
}

export async function signout() {
    return await signOut({ redirectTo: REDIRECT_WITHOUT_AUTH_TO });
}

/**
 * Changes the user's password to a new value, but only if the value they provided for the old password matches
 * successfully against the current hash stored in the database.
 *
 * @data Data required to change the password (namely, the old password - to confirm the identity once more - and
 * the new password).
 * @return Whether the operation succeeded.
 */
export async function changePassword(data: ChangePasswordData) {
    if (ChangePasswordSchema.safeParse(data).error) return ResponseUnauthorized; // Can only really happen for abnormal requests
    const { oldPassword, password } = data;
    const id = await getUserIdOrRedirect();
    const oldHash = await getUserPasswordHash(id);
    if (!oldHash) return ResponseUnauthorized;
    if (!bcrypt.compareSync(oldPassword, oldHash)) return ResponseUnauthorized;
    await updateUserPassword(id, password);
    return ResponseOK;
}

export async function updateUser(data: UpdateUserData) {
    if (UpdateUserSchema.safeParse(data).error) return; // Can only happen for abnormal requests
    const id = await getUserIdOrRedirect();
    await editUser(id, data);
}
