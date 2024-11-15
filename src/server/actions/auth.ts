"use server";

import { signIn, signOut } from "@/server/auth";
import { REDIRECT_WITH_AUTH_TO } from "@/lib/routes";
import { CredentialsSigninData, CredentialsSignupData } from "@/lib/validation-schemas";
import { Response, ResponseConflict, ResponseUnauthorized } from "@/lib/responses";
import { CredentialsSignin } from "next-auth";
import { createCredentialsUser, getUserCredentialsByEmail } from "@/server/data/services/user";
import { redirect } from "next/navigation";

/**
 * Registers a user with credentials. Only for users with credentials because OAuth users
 * do not have a separate registration flow.
 *
 * @param formData Form data from the frontend.
 */
export async function signup({
    email,
    password,
}: CredentialsSignupData): Promise<Response | undefined> {
    const existingCredentials = await getUserCredentialsByEmail(email);
    if (existingCredentials) return ResponseConflict;
    await createCredentialsUser(email, password);
    redirect("/signin");
}

export async function signinWithCredentials({
    email,
    password,
}: CredentialsSigninData): Promise<Response | undefined> {
    try {
        await signIn("credentials", {
            redirectTo: REDIRECT_WITH_AUTH_TO,
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
    return await signOut();
}
