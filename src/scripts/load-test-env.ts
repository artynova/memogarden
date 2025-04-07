import dotenv from "dotenv";

process.env.ENV = "testing";
process.env.DB_HOST = "localhost"; // This is for Cypress to refer to the containerized database

dotenv.config({ path: "./.env.testing", override: true });
