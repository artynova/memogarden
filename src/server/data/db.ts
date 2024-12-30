import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/server/env";

function makeConnectionURL(
    user: string,
    password: string,
    host: string,
    port: number,
    name: string,
) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${encodeURIComponent(port)}/${name}`;
}

export const connectionURL = makeConnectionURL(
    env.DB_USER,
    env.DB_PASSWORD,
    env.DB_HOST,
    env.DB_PORT,
    env.DB_NAME,
);

export default drizzle({ connection: connectionURL, casing: "snake_case" }); // snake_case casing will convert TypeScript camelCase names to snake_case names conventional for SQL
