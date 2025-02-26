import "@/scripts/load-dev-env";
import { connectionURL } from "@/server/data/db";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/server/data/schemas",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionURL,
    },
    casing: "snake_case",
});
