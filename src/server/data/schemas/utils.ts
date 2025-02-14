import { timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Column builder that configures an automatically randomly generated UUID primary key column.
 *
 * @returns Column builder.
 */
export const autoId = () => uuid().primaryKey().defaultRandom();

/**
 * Column builder that configures a column with the same storage type as the "autoId" builder,
 * but without automated generation or primary key constraints. Basis for foreign keys.
 *
 * @returns Column builder.
 */
export const autoIdExternal = () => uuid();

/**
 * Column builder that configures a column with a timestamp qualified by a timezone.
 *
 * @returns Column builder.
 */
export const timestampTz = () => timestamp({ withTimezone: true });

/**
 * Standard timestamps for managed data objets: when the object was created and (optionally) soft-deleted.
 */
export const timestamps = {
    createdAt: timestampTz().notNull().defaultNow(),
    deletedAt: timestampTz(),
};
