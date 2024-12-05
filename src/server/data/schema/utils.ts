import { bigint, bigserial, timestamp } from "drizzle-orm/pg-core";

/**
 * Column builder that configures an auto-incrementing primary key bigint ID column.
 */
export const autoId = () => bigserial({ mode: "bigint" }).primaryKey();

/**
 * Column builder that configures a column with the same storage type as the "autoId" builder,
 * but without auto-incrementing or a primary key. Basis for foreign keys.
 */
export const autoIdExternal = () => bigint({ mode: "bigint" });

/**
 * Column builder that configures a column with a timestamp qualified by a timezone.
 */
export const timestampTz = () => timestamp({ withTimezone: true });

/**
 * Standard timestamps for managed data objets: when the object was created, last updated, and deleted.
 */
export const timestamps = {
    createdAt: timestampTz().notNull().defaultNow(),
    /**
     * When the row was last updated through a user interaction (does not include automatic updates, e.g., of health state).
     */
    updatedAt: timestampTz().notNull().defaultNow(),
    deletedAt: timestampTz(),
};
