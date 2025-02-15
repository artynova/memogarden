import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import {
    getOrCreateIdFromOAuth,
    getUser,
    getUserCredentialsByEmail,
    maybeSyncUserHealth,
    usesSupportedOAuth,
} from "@/server/data/services/user";
import bcrypt from "bcrypt";
import "next-auth/jwt";
import { signout } from "@/server/actions/user/actions";
import { redirect } from "next/navigation";
import { CredentialsSigninSchema } from "@/server/actions/user/schemas";

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

declare module "next-auth" {
    interface Session {
        user: {
            tokenIat?: number;
        } & DefaultSession["user"];
    }
}

/**
 * Auth.js config.
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",

            async authorize(credentials) {
                const parsedCredentials = CredentialsSigninSchema.safeParse(credentials);
                if (parsedCredentials.error) return null; // Meaningful format error reporting is done in the client-side form. If an error is detected here, the data was submitted in an unintended way (e.g., manually with cURL), so a meaningful response is not necessary
                const { email, password: attemptedPassword } = parsedCredentials.data; // The validation is properly handled
                const storedCredentials = await getUserCredentialsByEmail(email);
                if (!storedCredentials) return null;
                const { userId, passwordHash } = storedCredentials;
                if (!bcrypt.compareSync(attemptedPassword, passwordHash)) return null;
                return { id: userId, email };
            },
        }),
        GoogleProvider,
        FacebookProvider,
    ],
    callbacks: {
        async jwt({ user, profile, account, token }) {
            if (!user) return token; // Handle subsequent calls after sign-in, when the user data is no longer accessible
            if (!usesSupportedOAuth(account)) return { ...token, id: user.id }; // Case when the user uses credentials, the ID is already attached to the user object by the authorization process
            const internalId = await getOrCreateIdFromOAuth(account, profile!);
            return { ...token, id: internalId };
        },

        session({ session, token }) {
            return { ...session, user: { ...session.user, id: token.id, tokenIat: token.iat } };
        },
    },
};

/**
 * Auth.js setup results.
 */
export const {
    /**
     * Auth.js route handlers.
     */
    handlers: { GET, POST },
    /**
     * Auth.js authentication function for server and edge.
     */
    auth,
    /**
     * Auth.js server-side sign-in function.
     */
    signIn,
    /**
     * Auth.js server-side sign-out function.
     */
    signOut,
} = NextAuth(authConfig);

/**
 * If the current session is valid, synchronizes the health of the associated user and returns the updated user data.
 * Otherwise, redirects to the sign-in page with the invalid token flag in search parameters (which is done by throwing
 * an exception and interrupting the flow).
 *
 * This version of the method is meant for Server Components, which cannot modify cookies and need
 * to rely on the intermediate sign-out page to destroy any invalid cookies.
 *
 * @returns User data after synchronization.
 */
export async function getUserOrRedirectSC() {
    const { id, tokenIat } = (await auth())?.user ?? {};
    if (!id) signoutSC(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) signoutSC(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    if (user!.acceptTokensAfter >= new Date((tokenIat ?? 0) * 1000)) signoutSC();
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

/**
 * Redirects to the sign-in route with the search parameters flag to trigger token destruction, allowing to trigger a
 * seamless sign-out from Server Components.
 */
function signoutSC() {
    redirect("/signin?invalidToken");
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns the
 * updated user data. Otherwise, destroys any session cookies and redirects to the sign-in page
 * (which is done by throwing an exception and interrupting the flow).
 *
 * This works in any server context where cookies can be modified, but does not work in
 * Server Components.
 *
 * @returns User data after synchronization.
 * @see getUserOrRedirectSC
 */
export async function getUserOrRedirect() {
    const { id, tokenIat } = (await auth())?.user ?? {};
    if (!id) await signout(); // This triggers a redirect, which works by throwing an exception, so in subsequent code the id can be safely assumed to be truthy
    const user = await getUser(id!);
    if (!user) await signout(); // Again, this branch triggers an exception if the user object is falsy, so in subsequent code it can be assumed to be truthy
    if (user!.acceptTokensAfter >= new Date((tokenIat ?? 0) * 1000)) await signout();
    const syncHappened = await maybeSyncUserHealth(id!);
    return syncHappened ? (await getUser(id!))! : user!; // Re-fetch the user only if the sync did occur
}

/**
 * If the current session is valid, synchronizes the health of the associated user and returns just
 * the user's ID. Otherwise, destroys any session cookies and redirects to the sign-in page (which
 * is done by throwing an exception and interrupting the flow).
 *
 * This is a convenience wrapper for {@link getUserOrRedirect} that is for cases when only the ID
 * is needed.
 *
 * @returns User's ID.
 */
export async function getUserIdOrRedirect() {
    return (await getUserOrRedirect()).id;
}
