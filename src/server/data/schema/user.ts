import { bigint, bigserial, char, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * Table with common user data across all authentication methods.
 */
export const user = pgTable("user", {
    id: bigserial({ mode: "bigint" }).primaryKey(),
});

/**
 * Column builder that configures a reference to a user entry.
 */
export const userReference = bigint({ mode: "bigint" }).references(() => user.id);

/**
 * User credentials - only for users who use credentials-based authentication.
 */
export const userCredentials = pgTable("user_credentials", {
    userId: userReference.primaryKey(),
    email: varchar().unique().notNull(),
    passwordHash: char({ length: 60 }).notNull(), // bcrypt hash output is exactly 60 characters
});

export const userGoogle = pgTable("user_google", {
    userId: userReference.primaryKey(),
    sub: varchar().notNull(), // Subject ID returned by Google, link between the external account and the MemoGarden account
});

export const userFacebook = pgTable("user_facebook", {
    userId: userReference.primaryKey(),
    sub: varchar().notNull(), // Subject ID returned by Facebook, link between the external account and the MemoGarden account
});
