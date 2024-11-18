import { bigint, bigserial, timestamp } from "drizzle-orm/pg-core";

/**
 * Column builder that configures an auto-incrementing bigint ID column, making it a primary key.
 */
export const autoId = () => bigserial({ mode: "bigint" }).primaryKey();

/**
 * Column builder that configures a column with the same storage type as the "autoId" builder,
 * without auto-incrementing. Basis for foreign keys.
 */
export const autoIdExternal = () => bigint({ mode: "bigint" });

export const timestampTz = () => timestamp({ withTimezone: true });
