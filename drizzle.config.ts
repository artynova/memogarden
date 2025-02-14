import "@/scripts/load-dev-env";
import { defineConfig } from "drizzle-kit";
import { connectionURL } from "@/server/data/db";

export default defineConfig({
    schema: "./src/server/data/schemas",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionURL,
    },
    casing: "snake_case",
});
