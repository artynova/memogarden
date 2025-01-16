import { and, avg, eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { user, userCredentials, userFacebook, userGoogle } from "@/server/data/schema/user";
import db from "@/server/data/db";
import {
    eqPlaceholder,
    isNotDeleted,
    makeInsertPlaceholders,
    makeUpdatePlaceholders,
    takeFirstOrNull,
    toColumnMapping,
} from "@/server/data/services/utils";
import bcrypt from "bcrypt";
import { env } from "@/server/env";
import { Account, Profile } from "next-auth";
import { card } from "@/server/data/schema/card";
import { deck } from "@/server/data/schema/deck";
import { DateTime } from "luxon";
import { forceSyncCardsHealth } from "@/server/data/services/card";
import { forceSyncDecksHealth } from "@/server/data/services/deck";

const insertUserColumns = [user.timezone] as const;
const insertUserCredentialsColumns = [
    userCredentials.userId,
    userCredentials.email,
    userCredentials.passwordHash,
] as const;
const insertUserGoogleColumns = [userGoogle.userId, userGoogle.sub] as const;
const insertUserFacebookColumns = [userGoogle.userId, userGoogle.sub] as const;
const userHealthSyncDataColumns = [user.lastHealthSync, user.timezone] as const;

export type SelectUser = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;
export type SelectUserCredentials = InferSelectModel<typeof userCredentials>;
export type InsertUserCredentials = InferSelectModel<typeof userCredentials>;

/**
 * Placeholders: derived from insertUserColumns.
 */
const insertUser = db
    .insert(user)
    .values(makeInsertPlaceholders(insertUserColumns))
    .returning({ id: user.id })
    .prepare("insert_user");

/**
 * Placeholders: "id" = user's ID.
 */
const selectUser = db.select().from(user).where(eqPlaceholder(user.id)).prepare("select_user");

const selectCredentialsByEmail = db
    .select()
    .from(userCredentials)
    .where(eqPlaceholder(userCredentials.email))
    .prepare("select_credentials_by_email");
const insertCredentials = db
    .insert(userCredentials)
    .values(makeInsertPlaceholders(insertUserCredentialsColumns))
    .prepare("insert_credentials");
const selectUserGoogleBySub = db
    .select()
    .from(userGoogle)
    .where(eqPlaceholder(userGoogle.sub))
    .prepare("select_google_user_by_sub");
const insertUserGoogle = db
    .insert(userGoogle)
    .values(makeInsertPlaceholders(insertUserGoogleColumns))
    .prepare("insert_user_google");
const selectUserFacebookBySub = db
    .select()
    .from(userFacebook)
    .where(eqPlaceholder(userFacebook.sub))
    .prepare("select_google_user_by_sub");
const insertUserFacebook = db
    .insert(userFacebook)
    .values(makeInsertPlaceholders(insertUserFacebookColumns))
    .prepare("insert_user_facebook");

/**
 * Placeholders: "id" = user's ID.
 */
const updateUserRetrievability = db
    .update(user)
    .set({
        retrievability: sql`(${db
            .select({ average: avg(card.retrievability) })
            .from(card)
            .innerJoin(deck, eq(card.deckId, deck.id))
            .where(and(eqPlaceholder(deck.userId, "id"), isNotDeleted(card))) // NULL retrievabilities are ignored by the AVG function so no need to filter them out explicitly
            .getSQL()})`, // Parentheses around the subquery are necessary to avoid syntax errors
    })
    .where(eqPlaceholder(user.id));

/**
 * Placeholders: "id" = user's ID, "lastHealthSync" = new value for the last sync date.
 */
const updateHealthSyncDate = db
    .update(user)
    .set(makeUpdatePlaceholders([user.lastHealthSync] as const))
    .where(eqPlaceholder(user.id))
    .prepare("update_health_sync_date");

/**
 * Placeholders: "id" = user's ID.
 */
const selectUserHealthSyncData = db
    .select(toColumnMapping(userHealthSyncDataColumns))
    .from(user)
    .where(eqPlaceholder(user.id))
    .prepare("select_last_sync_date");

/**
 * Creates a new base user entry (without auth information).
 *
 * @param timezone User's inferred timezone.
 * @return Internal ID of the newly created user.
 */
async function createUser(timezone: string) {
    return (await insertUser.execute({ timezone }).then(takeFirstOrNull))!.id;
}

/**
 * Retrieves a user by their MemoGarden ID.
 *
 * @param id User's ID.
 * @return General user record for the user with the matching ID, or `null` if such does not exist.
 */
export async function getUser(id: string): Promise<SelectUser | null> {
    return await selectUser.execute({ id }).then(takeFirstOrNull);
}

/**
 * Updates the recorded last daily sync date for the user's account to the given date.
 *
 * @param id User's ID.
 * @param newLastSync New date.
 */
export async function updateUserHealthSyncDate(id: string, newLastSync: Date) {
    await updateHealthSyncDate.execute({ id, lastHealthSync: newLastSync });
}

/**
 * Updates the stored average retrievability of all cards associated with the user's account based on the current cards'
 * current retrievabilities.
 *
 * @param id User's ID.
 */
export async function forceSyncUserHealth(id: string) {
    await updateUserRetrievability.execute({ id });
}

/**
 * If the user's collection's "health" (for cards, decks, and overall) has not yet been recalculated for the current
 * calendar date in their timezone, recalculates all card health values by using retrievability at 12 AM on the current
 * date in the user's timezone. Also recalculates all values derived from individual card health, i.e., deck health
 * and overall health.
 *
 * If the values have already been recalculated for the current date, the method does nothing.
 *
 * @param id User's ID.
 */
export async function maybeSyncUserHealth(id: string) {
    const syncData = await selectUserHealthSyncData.execute({ id: id }).then(takeFirstOrNull);
    if (!syncData) return; // Since a user is guaranteed to have non-null lastHealthSync, this case means that the user ID itself was invalid and nothing can be done further

    const { lastHealthSync, timezone } = syncData;
    const lastSyncInTimezone = DateTime.fromJSDate(lastHealthSync, { zone: timezone });
    const nowInTimezone = DateTime.now().setZone(timezone);
    if (lastSyncInTimezone.hasSame(nowInTimezone, "day")) return; // If the check returns true, the sync has already occurred "today" from the user's perspective and a new sync is not needed

    const sameDayNoonInTimezone = nowInTimezone.set({
        hour: 12, // Using noon, the median point of the day, to minimize the time gaps between the time of computed retrievability and the boundaries of the day it represents (i.e., at most 12 hours - interval to the start and to the end of the day)
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    await forceSyncCardsHealth(id, sameDayNoonInTimezone.toJSDate());
    await forceSyncDecksHealth(id);
    await forceSyncUserHealth(id);
    await updateUserHealthSyncDate(id, nowInTimezone.toUTC().toJSDate());
}

/**
 * Retrieves user's full credentials by email.
 *
 * @param email Email.
 * @return Credentials of the user with the email, or `null` if no such user exists.
 */
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
 * @param timezone String representation of the user's inferred timezone.
 * @return Internal ID of the newly created user.
 */
export async function createCredentialsUser(email: string, password: string, timezone: string) {
    const userId = await createUser(timezone);
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

/**
 * Retrieves the MemoGarden ID of a user by their OAuth data (provider and subject ID).
 *
 * @param provider Provider ("google" or "facebook").
 * @param sub Subject ID returned by the provider.
 * @return User's ID, or `null` if the corresponding user does not exist.
 */
export async function getUserIdBySub(provider: "google" | "facebook", sub: string) {
    const user = await OAuthProviderToStatements[provider].selectBySub
        .execute({ sub })
        .then(takeFirstOrNull);
    if (user) return user?.userId;
    return null;
}

/**
 * OAuth account with one of the specific supported providers (currently Google or Facebook).
 */
export type SupportedAccount = Account & {
    provider: "google" | "facebook";
};

/**
 * Verifies that the account uses supported providers.
 *
 * @param account OAuth account to be checked.
 * @return `true` if the account object is non-null and has either "google" or "facebook" set as the provider.
 */
export function usesSupportedOAuth(account: Account | null): account is SupportedAccount {
    return account?.provider === "google" || account?.provider === "facebook";
}

/**
 * Retrieves the MemoGarden ID that corresponds to the user identified by the OAuth information.
 * Will create a new user if the user does not exist (i.e., it is their first sign-in with these OAuth credentials).
 *
 * @param account Account returned by Auth.js, ensured to be provided by Google or Facebook.
 * @param profile ProfileBadge returned by Auth.js.
 * @return ID of the MemoGarden user (potentially newly created).
 */
export async function getOrCreateIdFromOAuth(account: SupportedAccount, profile: Profile) {
    const provider = account.provider;
    const sub = account.providerAccountId.toString();
    const timezone = profile.zoneinfo ?? "Etc/UTC"; // Default to the UTC timezone
    const internalId = await getUserIdBySub(provider, sub);
    if (internalId) return internalId; // User exists, just return the ID
    return createOAuthUser(provider, sub, timezone); // User lookup failed, create instead
}

/**
 * Creates a new user with OAuth-based authentication.
 * Assumes that the sub is unique for this provider, assumption should be verified externally.
 *
 * @param provider OAuth provider string.
 * @param sub Subject ID in the provider's system.
 * @param timezone String representation of the user's inferred timezone.
 * @return Internal ID of the newly created user.
 */
export async function createOAuthUser(
    provider: "google" | "facebook",
    sub: string,
    timezone: string,
) {
    const userId = await createUser(timezone);
    await OAuthProviderToStatements[provider].insert.execute({ userId, sub });
    return userId;
}
