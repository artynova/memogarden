import dotenv from "dotenv";

process.env.ENV = "development";

dotenv.config({ path: "./.env.development", override: true });
