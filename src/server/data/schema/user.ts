import { boolean, char, doublePrecision, pgTable, smallint, varchar } from "drizzle-orm/pg-core";
import { autoId, autoIdExternal, timestampTz } from "@/server/data/schema/utils";

/**
 * Table with IDs of all valid avatars.
 * The avatars are inserted manually via DB migrations.
 */
export const avatar = pgTable("avatar", {
    id: smallint().primaryKey(),
});

export const avatarReference = () => smallint().references(() => avatar.id);

/**
 * Table with common user data across all authentication methods.
 */
export const user = pgTable("user", {
    id: autoId(),
    lastHealthSync: timestampTz().notNull().defaultNow(), // When was the last automatic account-wide update of card retrievabilities (and thus "health")
    timezone: varchar({ length: 50 }).notNull(), // Canonical IANA timezone name, e.g., America/New_York
    retrievability: doublePrecision(), // Aggregated average retrievability of all active cards of the account
    avatarId: avatarReference().notNull().default(0),
    darkMode: boolean(), // Nullable, absence means that explicit preference in the app is not chosen and system light / dark mode setting should be used instead
    acceptTokensAfter: timestampTz().notNull().defaultNow(), // Session tokens store the "issued at" date, and if they are issued before the date stored here, they are considered invalidated
});

/**
 * Column builder that configures a reference to a user entry.
 */
export const userReference = () => autoIdExternal().references(() => user.id);

/**
 * User credentials - only for users who use credentials-based authentication.
 */
export const userCredentials = pgTable("user_credentials", {
    userId: userReference().primaryKey(),
    email: varchar({ length: 320 }).unique().notNull(),
    passwordHash: char({ length: 60 }).notNull(), // bcrypt hash output is exactly 60 characters
});

/**
 * Identification data for users authenticated by Google.
 */
export const userGoogle = pgTable("user_google", {
    userId: userReference().primaryKey(),
    sub: varchar({ length: 300 }).unique().notNull(), // Subject ID returned by Google, link between the external account and the MemoGarden account
});

/**
 * Authentication data for users authenticated by Facebook.
 */
export const userFacebook = pgTable("user_facebook", {
    userId: userReference().primaryKey(),
    sub: varchar({ length: 300 }).unique().notNull(), // Subject ID returned by Facebook, link between the external account and the MemoGarden account
});
