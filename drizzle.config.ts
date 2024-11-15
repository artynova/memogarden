import { defineConfig } from "drizzle-kit";
import { connectionURL } from "@/server/data/db";

export default defineConfig({
    schema: "./src/server/data/schema",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionURL,
    },
    casing: "snake_case",
});
