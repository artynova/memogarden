import { and, avg, count, eq, gte, InferSelectModel, lt, lte, sql } from "drizzle-orm";
import {
    avatar,
    user,
    userCredentials,
    userFacebook,
    userGoogle,
} from "@/server/data/schemas/user";
import db from "@/server/data/db";
import {
    eqOptionalPlaceholder,
    eqPlaceholder,
    isNotDeleted,
    makeInsertPlaceholders,
    makeUpdatePlaceholders,
    takeFirstOrNull,
    toColumnMapping,
} from "@/server/data/services/utils";
import bcrypt from "bcrypt";
import { env } from "@/server/env";
import { Account } from "next-auth";
import { card, reviewLog } from "@/server/data/schemas/card";
import { deck } from "@/server/data/schemas/deck";
import { DateTime } from "luxon";
import { forceSyncCardsHealth } from "@/server/data/services/card";
import { forceSyncDecksHealth } from "@/server/data/services/deck";

import {
    PREDICTION_LIMIT,
    RETROSPECTION_LIMIT,
    toSparseDatesReviews,
} from "@/lib/utils/statistics";
import {
    HIGH_MATURITY_THRESHOLD,
    MAX_MATURITY_THRESHOLD,
    MID_MATURITY_THRESHOLD,
} from "@/lib/ui/maturity";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

import { UpdateUserData } from "@/server/actions/user/schemas";
import { CardMaturity, CardState } from "@/lib/enums";

const insertUserColumns = [user.timezone] as const;

/**
 * Placeholders: derived from insertUserColumns.
 */
const insertUser = db
    .insert(user)
    .values(makeInsertPlaceholders(insertUserColumns))
    .returning({ id: user.id })
    .prepare("insert_user");

/**
 * Creates a new base user entry (without auth information).
 *
 * @param timezone User's timezone inferred by the client.
 * @returns Internal ID of the newly created user.
 */
async function createUser(timezone: string | null) {
    return (await insertUser.execute({ timezone }).then(takeFirstOrNull))!.id;
}

const updateUserColumns = [...insertUserColumns, user.avatarId, user.darkMode] as const;

/**
 * Placeholders: "id" = user's ID, others derived from updateUserColumns.
 */
const updateUser = db
    .update(user)
    .set(makeUpdatePlaceholders(updateUserColumns))
    .where(eqPlaceholder(user.id))
    .prepare("update_user");

/**
 * Updates user data that the user is allowed to modify directly (currently only timezone).
 *
 * @param id User's ID.
 * @param data Updated data.
 */
export async function editUser(id: string, data: UpdateUserData) {
    await updateUser.execute({ id, ...data });
}

const userHealthSyncDataColumns = [user.lastHealthSync, user.timezone] as const;

/**
 * Placeholders: "id" = user's ID.
 */
const selectUserHealthSyncData = db
    .select(toColumnMapping(userHealthSyncDataColumns))
    .from(user)
    .where(eqPlaceholder(user.id))
    .prepare("select_last_sync_date");

/**
 * Retrieves user's data related to health sync (last date and current timezone).
 *
 * @param id User's ID.
 * @returns Health sync data.
 */
async function getHealthSyncData(id: string) {
    return selectUserHealthSyncData.execute({ id: id }).then(takeFirstOrNull);
}

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
 * Updates the stored average collection retrievability value of the user based on the current cards' current
 * retrievabilities.
 *
 * @param id User's ID.
 */
export async function forceSyncUserHealth(id: string) {
    await updateUserRetrievability.execute({ id });
}

/**
 * Placeholders: "id" = user's ID, "lastHealthSync" = new value for the last sync date.
 */
const updateHealthSyncDate = db
    .update(user)
    .set(makeUpdatePlaceholders([user.lastHealthSync] as const))
    .where(eqPlaceholder(user.id))
    .prepare("update_health_sync_date");

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
 * If the user's collection's "health" (for cards, decks, and overall) has not yet been recalculated for the current
 * calendar date in their timezone, recalculates all card health values by using retrievability at 12 PM (midday) on
 * the current date in the user's timezone. Also recalculates all values derived from individual card health, i.e.,
 * deck health and overall health. If the values have already been recalculated for the current date, does nothing.
 *
 * @param id User's ID.
 * @returns `true` if a sync operation did occur as a result of the call, `false` otherwise.
 */
export async function maybeSyncUserHealth(id: string) {
    const syncData = await getHealthSyncData(id);
    if (!syncData) return false; // Since a user is guaranteed to have non-null lastHealthSync, this case means that the user ID itself was invalid and nothing can be done further

    const { lastHealthSync, timezone } = syncData;
    if (!timezone) return false; // The timezone can only be unavailable immediately after sign-up in OAuth accounts, when there are no flashcards yet and thus no health to sync anyway. It would never be null in situations where a sync is actually necessary

    const lastSyncInTimezone = DateTime.fromJSDate(lastHealthSync, { zone: timezone });
    const nowInTimezone = DateTime.now().setZone(timezone);
    if (lastSyncInTimezone.hasSame(nowInTimezone, "day")) return false; // If the check returns true, the sync has already occurred "today" from the user's perspective and a new sync is not needed

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
    return true;
}

/**
 * Placeholders: "id" = user's ID, "acceptSessionsAfter" = new date such that all tokens issued before it are considered
 * invalid.
 */
const updateAcceptTokensAfter = db
    .update(user)
    .set(makeUpdatePlaceholders([user.acceptTokensAfter]))
    .where(eqPlaceholder(user.id))
    .prepare("update_accept_tokens_after");

/**
 * Invalidates all existing session tokens by moving forward the date tokens issued before which are considered invalid.
 *
 * @param id User's ID.
 */
export async function invalidateAllTokens(id: string) {
    await updateAcceptTokensAfter.execute({ id, acceptTokensAfter: new Date() });
}

/**
 * Avatar selection data.
 */
export type SelectAvatar = InferSelectModel<typeof avatar>;

const selectAllAvatars = db.select().from(avatar).prepare("select_all_avatars");

/**
 * Retrieves all valid avatar IDs.
 *
 * @returns Array of avatar ID entries.
 */
export async function getAllAvatars() {
    return selectAllAvatars.execute();
}

/**
 * General user selection data.
 */
export type SelectUser = InferSelectModel<typeof user>;

/**
 * Placeholders: "id" = user's ID.
 */
const selectUser = db.select().from(user).where(eqPlaceholder(user.id)).prepare("select_user");

/**
 * Retrieves a user by their MemoGarden ID.
 *
 * @param id User's ID.
 * @returns General user record for the user with the matching ID, or `null` if such does not exist.
 */
export async function getUser(id: string) {
    return await selectUser.execute({ id }).then(takeFirstOrNull);
}

const insertUserCredentialsColumns = [
    userCredentials.userId,
    userCredentials.email,
    userCredentials.passwordHash,
] as const;

/**
 * Placeholders: derived from insertUserCredentialsColumns
 */
const insertCredentials = db
    .insert(userCredentials)
    .values(makeInsertPlaceholders(insertUserCredentialsColumns))
    .prepare("insert_credentials");

/**
 * Creates a new user with credentials-based authentication.
 * Assumes that the email is unique, assumption should be verified externally.
 *
 * @param email User's email.
 * @param password User's password (will be hashed).
 * @param timezone User's timezone inferred by the client.
 * @returns Internal ID of the newly created user.
 */
export async function createCredentialsUser(email: string, password: string, timezone: string) {
    const userId = await createUser(timezone);
    const passwordHash = bcrypt.hashSync(password, env.AUTH_PASSWORD_SALT_ROUNDS);
    await insertCredentials.execute({ userId, email, passwordHash });
    return userId;
}

/**
 * Only for users that use platform-local credentials rather than OAuth.
 * Placeholders: "id" = user's ID, "passwordHash" = new value for the password hash.
 */
const updateUserPasswordHash = db
    .update(userCredentials)
    .set(makeUpdatePlaceholders([userCredentials.passwordHash]))
    .where(eqPlaceholder(userCredentials.userId, "id"))
    .prepare("update_user_password_hash");

/**
 * Hashes the given password and sets the stored password hash to the resulting value. This function assumes that
 * all the necessary security checks have already been performed.
 *
 * @param id User's ID.
 * @param newPassword New password that will be hashed.
 */
export async function updateUserPassword(id: string, newPassword: string) {
    const passwordHash = bcrypt.hashSync(newPassword, env.AUTH_PASSWORD_SALT_ROUNDS);
    await updateUserPasswordHash.execute({ id, passwordHash });
}

/**
 * Placeholders: "email" = user's email.
 */
const selectCredentialsByEmail = db
    .select()
    .from(userCredentials)
    .where(eqPlaceholder(userCredentials.email))
    .prepare("select_credentials_by_email");

/**
 * Retrieves user's full credentials by email.
 *
 * @param email Email.
 * @returns Credentials of the user with the email, or `null` if no such user exists.
 */
export async function getUserCredentialsByEmail(email: string) {
    return selectCredentialsByEmail.execute({ email }).then(takeFirstOrNull);
}

/**
 * Placeholders: "id" = user's ID.
 */
const selectPasswordHash = db
    .select(toColumnMapping([userCredentials.passwordHash]))
    .from(userCredentials)
    .where(eqPlaceholder(userCredentials.userId, "id"))
    .prepare("select_credentials");

/**
 * Retrieves a user's password hash by user ID (only works for credentials users).
 *
 * @param id User's ID.
 * @returns Password hash, or `null` if the ID does not belong to an existing credentials-authenticated user.
 */
export async function getUserPasswordHash(id: string) {
    const result = (await selectPasswordHash.execute({ id }).then(takeFirstOrNull))?.passwordHash;
    return result === undefined ? null : result;
}

/**
 * Checks whether a user with a given ID uses credentials-based authentication.
 *
 * @param id User's ID.
 * @returns `true` if the ID is associated with a credentials-authenticated user, `false`
 * otherwise (i.e., if the user does not exist or is not credentials-authenticated).
 */
export async function isCredentialsUser(id: string) {
    return !!(await getUserPasswordHash(id)); // If the hash (inherently truthy) was found, it means that the ID belongs to a valid credentials user. Otherwise, the user ID may not exist or may belong to an OAuth user
}

const insertUserGoogleColumns = [userGoogle.userId, userGoogle.accountId] as const;

/**
 * Placeholders: derived from insertUserGoogleColumns.
 */
const insertUserGoogle = db
    .insert(userGoogle)
    .values(makeInsertPlaceholders(insertUserGoogleColumns))
    .prepare("insert_user_google");

/**
 * Placeholders: "accountId" = account ID in Google's system.
 */
const selectUserGoogleByAccountId = db
    .select()
    .from(userGoogle)
    .where(eqPlaceholder(userGoogle.accountId))
    .prepare("select_user_google_by_account_id");

const insertUserFacebookColumns = [userFacebook.userId, userFacebook.accountId] as const;

/**
 * Placeholders: derived from insertUserFacebookColumns.
 */
const insertUserFacebook = db
    .insert(userFacebook)
    .values(makeInsertPlaceholders(insertUserFacebookColumns))
    .prepare("insert_user_facebook");

/**
 * Placeholders: "accountId" = account ID in Facebook's system.
 */
const selectUserFacebookByAccountId = db
    .select()
    .from(userFacebook)
    .where(eqPlaceholder(userFacebook.accountId))
    .prepare("select_user_facebook_by_account_id");

const OAuthProviderToStatements = {
    google: {
        insert: insertUserGoogle,
        selectByAccountId: selectUserGoogleByAccountId,
    },
    facebook: {
        insert: insertUserFacebook,
        selectByAccountId: selectUserFacebookByAccountId,
    },
};

/**
 * Retrieves the MemoGarden ID of a user by their external identification data (OAuth provider and ID in the provider's system).
 *
 * @param provider Provider ("google" or "facebook").
 * @param accountId Account ID in the provider's system.
 * @returns User's ID, or `null` if the corresponding user does not exist.
 */
async function getUserIdBySub(provider: "google" | "facebook", accountId: string) {
    const user = await OAuthProviderToStatements[provider].selectByAccountId
        .execute({ accountId })
        .then(takeFirstOrNull);
    return user?.userId ?? null;
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
 * @returns `true` if the account object is non-null and has either "google" or "facebook" set as the provider.
 */
export function usesSupportedOAuth(account: Account | null): account is SupportedAccount {
    return account?.provider === "google" || account?.provider === "facebook";
}

/**
 * Creates a new user with OAuth-based authentication.
 *
 * @param provider OAuth provider string.
 * @param accountId Account ID in the provider's system.
 * @param timezone User's timezone inferred from the OAuth data, or `null` if timezone data is unavailable (will trigger delayed inference later).
 * @returns Internal ID of the newly created user.
 */
async function createOAuthUser(
    provider: "google" | "facebook",
    accountId: string,
    timezone: string | null,
) {
    const userId = await createUser(timezone);
    await OAuthProviderToStatements[provider].insert.execute({ userId, accountId });
    return userId;
}

/**
 * Retrieves the internal ID that corresponds to the user identified by the OAuth information.
 * Will create a new user if the user does not exist (i.e., it is their first sign-in with these OAuth credentials).
 *
 * @param account Account returned by Auth.js, ensured to be provided by Google or Facebook.
 * @returns Internal ID of the user (potentially newly created).
 */
export async function getOrCreateIdFromOAuth(account: SupportedAccount) {
    const provider = account.provider;
    const accountId = account.providerAccountId;
    const timezone = null; // Clearly mark timezone as missing via null value to force inference later
    const internalId = await getUserIdBySub(provider, accountId);
    if (internalId) return internalId; // User exists, just return the ID
    return createOAuthUser(provider, accountId, timezone); // User lookup failed, create instead
}

/**
 * Counts non-deleted cards, providing information on the current state of the collection
 * Placeholders: "id" = user's ID, "deckId" = optional ID of the deck to limit statistics to that deck instead of the
 * entire account (ignored if NULL).
 */
const selectUserCardCount = db
    .select({ count: count() })
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .where(
        and(
            eqPlaceholder(deck.userId, "id"),
            eqOptionalPlaceholder(deck.id, "deckId"),
            isNotDeleted(card),
        ),
    )
    .prepare("select_user_card_count");

/**
 * Counts how many cards there are either in the entire collection of a user or in a specific deck.
 *
 * @param id User's ID.
 * @param deckId Deck's ID (or `null` to count for the entire collection).
 * @returns Card count.
 */
export async function countCards(id: string, deckId: string | null) {
    return (await selectUserCardCount.execute({ id, deckId }).then(takeFirstOrNull))!.count;
}

/**
 * Counts reviews of all cards, including previously deleted cards, thus providing more historical information.
 */
const selectUserReviewCount = db
    .select({ count: count() })
    .from(reviewLog)
    .innerJoin(card, eq(card.id, reviewLog.cardId))
    .innerJoin(deck, eq(deck.id, card.deckId))
    .where(and(eqPlaceholder(deck.userId, "id"), eqOptionalPlaceholder(deck.id, "deckId")))
    .prepare("select_user_review_count");

/**
 * Counts how many reviews the user has done in the past, either for the entire collection or for a specific deck.
 *
 * @param id User's ID.
 * @param deckId Deck's ID (or `null` to count for the entire collection).
 * @returns Review count.
 */
export async function countReviews(id: string, deckId: string | null) {
    return (await selectUserReviewCount.execute({ id, deckId }).then(takeFirstOrNull))!.count;
}

/**
 * Placeholders: "id" = user's ID, "deckId" = optional ID of the deck.
 */
const selectCardCounts = db
    .select({
        maturity: sql<number>`maturities
        .
        maturity::smallint`,
        cards: sql<number>`COALESCE(counts.count, 0)::integer`,
    })
    .from(
        // This subquery selects counts for all maturities where at least one card of said maturity exists in the selection
        sql`(${db
            .select({
                maturity: sql<number>`(
                                              CASE
                                              WHEN ${eq(card.stateId, CardState.New)} THEN ${CardMaturity.Seed}
                                              WHEN ${inArray(card.stateId, [CardState.Learning, CardState.Relearning])} THEN ${CardMaturity.Sprout}
                                              WHEN ${lt(card.scheduledDays, MID_MATURITY_THRESHOLD)} THEN ${CardMaturity.Sapling}
                                              WHEN ${lt(card.scheduledDays, HIGH_MATURITY_THRESHOLD)} THEN ${CardMaturity.Budding}
                                              WHEN ${lt(card.scheduledDays, MAX_MATURITY_THRESHOLD)} THEN ${CardMaturity.Mature}
                                              ELSE ${CardMaturity.Mighty}
                                              END)
                                          AS maturity`,
                count: sql<number>`${count(card.id)}
                    AS count`,
            })
            .from(card)
            .innerJoin(deck, eq(deck.id, card.deckId))
            .where(
                and(
                    eqPlaceholder(deck.userId, "id"),
                    eqOptionalPlaceholder(deck.id, "deckId"),
                    isNotDeleted(card),
                ),
            )
            .groupBy(sql`maturity`)})
            as counts`,
    )
    .rightJoin(
        // This subquery constructs a table with all possible maturities, and the right join ensures that each maturity has an entry in the result set
        sql`
            (VALUES (${CardMaturity.Seed}),
                    (${CardMaturity.Sprout}),
                    (${CardMaturity.Sapling}),
                    (${CardMaturity.Budding}),
                    (${CardMaturity.Mature}),
                    (${CardMaturity.Mighty}))
            AS maturities(maturity)`,
        eq(
            sql`counts
            .
            maturity`,
            sql`maturities
            .
            maturity`,
        ),
    )
    .prepare("select_card_counts");

/**
 * Counts how many cards of each maturity stage are present in the user's collection overall or a specific deck.
 *
 * @param id User's ID.
 * @param deckId Deck's ID (or `null` to count for the entire collection).
 * @returns Array of count entries for each maturity, with maturities being represented by their enum numbers.
 */
export async function countCardsByMaturities(id: string, deckId: string | null) {
    return selectCardCounts.execute({ id, deckId });
}

const retrospectionInterval = `${RETROSPECTION_LIMIT - 1} days`;

/**
 * Placeholders: "id" = user's ID, "anchor" = date from which to start retrospecting, "deckId" = optional ID of the
 * deck to limit statistics to that deck instead of the entire account (ignored if NULL).
 */
const selectRetrospectionStatistics = db
    .select({
        date: sql<string>`((${reviewLog.review} AT TIME ZONE ${user.timezone}):: date :: timestamp AT TIME ZONE ${user.timezone})
                          AS date`,
        reviews: count(),
    })
    .from(reviewLog)
    .innerJoin(card, eq(card.id, reviewLog.cardId))
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(user, eq(user.id, deck.userId))
    .where(
        and(
            eqOptionalPlaceholder(deck.id, "deckId"),
            eqPlaceholder(user.id),
            // Check whether the date is within the retrospection limit
            gte(
                reviewLog.review,
                sql`((${sql.placeholder("anchor")} AT TIME ZONE ${user.timezone}):: date - ${retrospectionInterval}:: interval)
                    ::timestamp AT TIME ZONE
                    ${user.timezone}`,
            ),
            // This query does NOT filter out deleted cards and decks, because they still contributed to daily review counts even if they were deleted
        ),
    )
    .groupBy(sql`date`)
    .prepare("select_retrospective_statistics");

/**
 * Calculates statistics about past reviews for all dates within the last 30 days that have had at least one review.
 * The dates are represented by ISO date segments, and any non-present dates from the last thirty days can be safely
 * assumed to have had 0 reviews.
 *
 * @param id User's ID.
 * @param anchor Date from which to start retrospecting.
 * @param deckId Deck's ID (or `null` to retrospect for the entire collection).
 * @returns Mapping of date string segments to respective non-0 numbers of conducted reviews.
 */
export async function getSparseRetrospection(id: string, anchor: Date, deckId: string | null) {
    return toSparseDatesReviews(
        await selectRetrospectionStatistics.execute({ id, anchor, deckId }),
    );
}

const predictionInterval = `${PREDICTION_LIMIT - 1} days`;

/**
 * Placeholders: "id" = user's ID, "anchor" = date from which to start predicting, "deckId" = optional ID of the
 * deck to limit statistics to that deck instead of the entire account (ignored if NULL).
 */
const selectPredictionStatistics = db
    .select({
        date: sql<string>`((${card.due} AT TIME ZONE ${user.timezone}):: date :: timestamp AT TIME ZONE ${user.timezone})
                          AS date`,
        reviews: count(),
    })
    .from(card)
    .innerJoin(deck, eq(deck.id, card.deckId))
    .innerJoin(user, eq(user.id, deck.userId))
    .where(
        and(
            eqOptionalPlaceholder(deck.id, "deckId"),
            eqPlaceholder(user.id),
            lte(
                card.due,
                sql`((${sql.placeholder("anchor")} AT TIME ZONE ${user.timezone}):: date + ${predictionInterval}:: interval)
                    ::timestamp AT TIME ZONE
                    ${user.timezone}`,
            ),
            isNotDeleted(card), // This query does filter out deleted cards, because the user will not encounter them for review
        ),
    )
    .groupBy(sql`date`)
    .prepare("select_prediction_statistics");

/**
 * Calculates statistics about predicted future reviews for all dates within the upcoming 30 days that have at least one
 * scheduled review. The dates are represented by ISO date segments, and any non-present dates from the interval can be
 * safely assumed to have 0 scheduled reviews.
 *
 * @param id User's ID.
 * @param anchor Date from which to start predicting.
 * @param deckId Deck's ID (or `null` to predict for the entire collection).
 * @returns Mapping of date string segments to respective non-0 numbers of scheduled reviews.
 */
export async function getSparsePrediction(id: string, anchor: Date, deckId: string | null) {
    return toSparseDatesReviews(await selectPredictionStatistics.execute({ id, anchor, deckId }));
}
