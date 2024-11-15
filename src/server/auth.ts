import NextAuth, { Account, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import {
    createOAuthUser,
    getUserCredentialsByEmail,
    getUserIdBySub,
} from "@/server/data/services/user";
import { CredentialsSigninSchema } from "@/lib/validation-schemas";
import bcrypt from "bcrypt";
import "next-auth/jwt";

function usesSupportedOAuth(account: Account | null) {
    return account?.provider === "google" || account?.provider === "facebook";
}

async function getIdFromOAuth(provider: "google" | "facebook", sub: string) {
    const internalId = await getUserIdBySub(provider, sub);
    if (internalId) return internalId;
    return createOAuthUser(provider, sub);
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email:",
                    type: "text",
                    placeholder: "your-email",
                },
                password: {
                    label: "Password:",
                    type: "text",
                },
            },

            async authorize(credentials) {
                const parsedCredentials = CredentialsSigninSchema.safeParse(credentials);
                if (parsedCredentials.error) return null; // Meaningful format error reporting is done in the client-side form. If an error is detected here, the data was submitted in an unintended way (e.g., manually with cURL), so a meaningful response is not necessary
                const { email, password: attemptedPassword } = parsedCredentials.data; // The validation is properly handled
                const storedCredentials = await getUserCredentialsByEmail(email);
                if (!storedCredentials) return null;
                const { userId, passwordHash } = storedCredentials;
                if (!bcrypt.compareSync(attemptedPassword, passwordHash)) return null;
                return { id: userId.toString(), email };
            },
        }),
        GoogleProvider,
        FacebookProvider,
    ],
    callbacks: {
        // Adds the user's internal MemoGarden ID to the token
        async jwt({ user, account, token }) {
            if (!usesSupportedOAuth(account)) return { ...token, id: user.id };
            const internalId = await getIdFromOAuth(
                account!.provider as "google" | "facebook",
                account!.providerAccountId,
            );
            return { ...token, id: internalId.toString() };
        },

        // Adds the user's internal MemoGarden ID to the session user object
        session({ session, token }) {
            return { ...session, user: { ...session.user, id: token.id } };
        },
    },
};

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth(authConfig);
