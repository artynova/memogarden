import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import {
    getOrCreateIdFromOAuth,
    getUserCredentialsByEmail,
    usesSupportedOAuth,
} from "@/server/data/services/user";
import bcrypt from "bcrypt";
import "next-auth/jwt";
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
