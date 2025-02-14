import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/server/env";
import { migrate as drizzleMigrate } from "drizzle-orm/node-postgres/migrator";

/**
 * Creates the database connection URL based on the provided credentials.
 *
 * @param user Database user.
 * @param password Database password.
 * @param host Database host.
 * @param port Database port.
 * @param name Database name.
 * @returns Connection URL.
 */
function makeConnectionURL(
    user: string,
    password: string,
    host: string,
    port: number,
    name: string,
) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${encodeURIComponent(port)}/${encodeURIComponent(name)}`;
}

/**
 * URL for connecting to the PostgreSQL database.
 */
export const connectionURL = makeConnectionURL(
    env.DB_USER,
    env.DB_PASSWORD,
    env.DB_HOST,
    env.DB_PORT,
    env.DB_NAME,
);

const db = drizzle({ connection: connectionURL, casing: "snake_case" }); // snake_case casing will convert TypeScript camelCase names to snake_case names conventional for SQL

/**
 * Drizzle database client.
 */
export default db;

/**
 * Runs Drizzle migrations programmatically. Idempotent - applying an already applied migration
 * does not do anything.
 */
export async function migrate() {
    await drizzleMigrate(db, { migrationsFolder: "drizzle" });
}
