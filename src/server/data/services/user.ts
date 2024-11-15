import { eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { user, userCredentials, userFacebook, userGoogle } from "@/server/data/schema/user";
import db from "@/server/data/db";
import { takeFirstOrNull } from "@/server/data/services/common";
import bcrypt from "bcrypt";
import { env } from "@/server/env";

export type SelectUser = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;
export type SelectUserCredentials = InferSelectModel<typeof userCredentials>;
export type InsertUserCredentials = InferSelectModel<typeof userCredentials>;

// Prepared statements to improve performance
const insertUser = db.insert(user).values({}).returning({ id: user.id }).prepare("insert_user");
const selectCredentialsByEmail = db
    .select()
    .from(userCredentials)
    .where(eq(userCredentials.email, sql.placeholder("email")))
    .prepare("select_credentials_by_email");
const insertCredentials = db
    .insert(userCredentials)
    .values({
        userId: sql.placeholder("userId"),
        email: sql.placeholder("email"),
        passwordHash: sql.placeholder("passwordHash"),
    })
    .prepare("insert_credentials");
const selectUserGoogleBySub = db
    .select()
    .from(userGoogle)
    .where(eq(userGoogle.sub, sql.placeholder("sub")))
    .prepare("select_google_user_by_sub");
const insertUserGoogle = db
    .insert(userGoogle)
    .values({
        userId: sql.placeholder("userId"),
        sub: sql.placeholder("sub"),
    })
    .prepare("insert_user_google");
const selectUserFacebookBySub = db
    .select()
    .from(userFacebook)
    .where(eq(userFacebook.sub, sql.placeholder("sub")))
    .prepare("select_google_user_by_sub");
const insertUserFacebook = db
    .insert(userFacebook)
    .values({
        userId: sql.placeholder("userId"),
        sub: sql.placeholder("sub"),
    })
    .prepare("insert_user_facebook");

async function createUser() {
    return (await insertUser.execute().then(takeFirstOrNull))!.id;
}

export async function getUserCredentialsByEmail(
    email: string,
): Promise<SelectUserCredentials | null> {
    return selectCredentialsByEmail.execute({ email }).then(takeFirstOrNull);
}

/**
 * Creates a new user with credentials-based authentication.
 * Assumes that the email is unique, assumption should be verified externally.
 *
 * @param email User's email.
 * @param password User's password (will be hashed).
 * @return Internal ID of the newly added user.
 */
export async function createCredentialsUser(email: string, password: string) {
    const userId = await createUser();
    const passwordHash = bcrypt.hashSync(password, env.AUTH_PASSWORD_SALT_ROUNDS);
    await insertCredentials.execute({ userId, email, passwordHash });
    return userId;
}

const OAuthProviderToStatements = {
    google: {
        selectBySub: selectUserGoogleBySub,
        insert: insertUserGoogle,
    },
    facebook: {
        selectBySub: selectUserFacebookBySub,
        insert: insertUserFacebook,
    },
};

export async function getUserIdBySub(provider: "google" | "facebook", sub: string) {
    const user = await OAuthProviderToStatements[provider].selectBySub
        .execute({ sub })
        .then(takeFirstOrNull);
    if (user) return user?.userId;
    return null;
}

/**
 * Creates a new user with OAuth-based authentication.
 * Assumes that the sub is unique for this provider, assumption should be verified externally.
 *
 * @param provider OAuth provider string.
 * @param sub Subject ID in the provider's system.
 * @return Internal ID of the newly added user.
 */
export async function createOAuthUser(provider: "google" | "facebook", sub: string) {
    const userId = await createUser();
    await OAuthProviderToStatements[provider].insert.execute({ userId, sub });
    return userId;
}
