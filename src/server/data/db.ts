import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/server/env";
import { migrate as drizzleMigrate } from "drizzle-orm/node-postgres/migrator";

function makeConnectionURL(
    user: string,
    password: string,
    host: string,
    port: number,
    name: string,
) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${encodeURIComponent(port)}/${encodeURIComponent(name)}`;
}

export const connectionURL = makeConnectionURL(
    env.DB_USER,
    env.DB_PASSWORD,
    env.DB_HOST,
    env.DB_PORT,
    env.DB_NAME,
);

const db = drizzle({ connection: connectionURL, casing: "snake_case" }); // snake_case casing will convert TypeScript camelCase names to snake_case names conventional for SQL

export default db;

/**
 * Run Drizzle migrations programmatically.
 */
export async function migrate() {
    await drizzleMigrate(db, { migrationsFolder: "drizzle" });
}
