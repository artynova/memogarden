import { EnvSchema } from "@/server/env";
import { describe, expect, test } from "vitest";

type SchemaPath = keyof typeof EnvSchema.shape;

function testVariableErrors(path: SchemaPath, values: (string | undefined)[]) {
    describe.each(values.map((value) => ({ value })))(
        `given input data with invalid ${path} $value`,
        ({ value }) => {
            test(`should report ${path} errors`, () => {
                const output = EnvSchema.safeParse({ [path]: value });

                expect(output).toHaveParsingErrors(path);
            });
        },
    );
}

function testVariableDefault(path: SchemaPath, value: string | number) {
    describe(`given input data with missing ${path}`, () => {
        test(`should use default value '${value}'`, () => {
            // Take just the field and use its definition to parse an undefined value, thus obtaining the field's default value (if it exists)
            const output = EnvSchema.shape[path].parse(undefined);

            expect(output).toEqual(value);
        });
    });
}

describe("EnvSchema", () => {
    // env file uses parse, but safeParse and parse detect the same errors and only differ in how they report them: safeParse returns error data as function output while parse throws
    // therefore, testing with safeParse is sufficient for checking whether the schema detects the errors in the first place
    describe("when schema's 'safeParse' is called", () => {
        testVariableErrors("ENV", ["", "fake env", "42"]);
        testVariableDefault("ENV", "development");

        testVariableErrors("PORT", ["", "a", "79", "65536"]);
        testVariableDefault("PORT", 3000);

        testVariableErrors("DB_USER", [""]);
        testVariableDefault("DB_USER", "postgres");

        testVariableErrors("DB_PASSWORD", [undefined, ""]);

        testVariableErrors("DB_HOST", [""]);
        testVariableDefault("DB_HOST", "localhost");

        testVariableErrors("DB_PORT", ["", "a", "999", "65536"]);
        testVariableDefault("DB_PORT", 5432);

        testVariableErrors("DB_NAME", [""]);
        testVariableDefault("DB_NAME", "postgres");

        testVariableErrors("AUTH_URL", [""]);

        testVariableErrors("AUTH_SECRET", ["", "13", "MTY="]);

        testVariableErrors("AUTH_PASSWORD_SALT_ROUNDS", ["", "a", "0", "21"]);
        testVariableDefault("AUTH_PASSWORD_SALT_ROUNDS", 12);

        testVariableErrors("AUTH_GOOGLE_ID", [""]);

        testVariableErrors("AUTH_GOOGLE_SECRET", [""]);

        testVariableErrors("AUTH_FACEBOOK_ID", [""]);

        testVariableErrors("AUTH_FACEBOOK_SECRET", [""]);

        describe.each([
            {
                data: {
                    ENV: "testing",
                    PORT: "3001",
                    DB_USER: "admin",
                    DB_PASSWORD: "adminadmin",
                    DB_HOST: "127.0.0.1",
                    DB_PORT: "2345",
                    DB_NAME: "memogarden",
                    AUTH_URL: "http://127.0.0.1:3001",
                    AUTH_SECRET: "ef/r6EMt310kaqe1cYX/iukXjFWh+9VnYIdL6OV+epM=",
                    AUTH_PASSWORD_SALT_ROUNDS: "20",
                    AUTH_GOOGLE_ID: "mock google id 1",
                    AUTH_GOOGLE_SECRET: "mock google secret 1",
                    AUTH_FACEBOOK_ID: "mock facebook id 1",
                    AUTH_FACEBOOK_SECRET: "mock facebook secret 1",
                },
                expected: {
                    ENV: "testing",
                    PORT: 3001,
                    DB_USER: "admin",
                    DB_PASSWORD: "adminadmin",
                    DB_HOST: "127.0.0.1",
                    DB_PORT: 2345,
                    DB_NAME: "memogarden",
                    AUTH_URL: "http://127.0.0.1:3001",
                    AUTH_SECRET: "ef/r6EMt310kaqe1cYX/iukXjFWh+9VnYIdL6OV+epM=",
                    AUTH_PASSWORD_SALT_ROUNDS: 20,
                    AUTH_GOOGLE_ID: "mock google id 1",
                    AUTH_GOOGLE_SECRET: "mock google secret 1",
                    AUTH_FACEBOOK_ID: "mock facebook id 1",
                    AUTH_FACEBOOK_SECRET: "mock facebook secret 1",
                },
            },
            {
                data: {
                    ENV: "production",
                    PORT: "80",
                    DB_USER: "user",
                    DB_PASSWORD: "12345",
                    AUTH_URL: "http://localhost:80",
                    AUTH_SECRET: "qp3Va5lZbolaQajDgqjuq0OkNHdsMUEsxA6ZF8N/E+4=",
                    AUTH_GOOGLE_ID: "mock google id 2",
                    AUTH_GOOGLE_SECRET: "mock google secret 2",
                    AUTH_FACEBOOK_ID: "mock facebook id 2",
                    AUTH_FACEBOOK_SECRET: "mock facebook secret 2",
                },
                expected: {
                    ENV: "production",
                    PORT: 80,
                    DB_USER: "user",
                    DB_PASSWORD: "12345",
                    DB_HOST: "localhost",
                    DB_PORT: 5432,
                    DB_NAME: "postgres",
                    AUTH_URL: "http://localhost:80",
                    AUTH_SECRET: "qp3Va5lZbolaQajDgqjuq0OkNHdsMUEsxA6ZF8N/E+4=",
                    AUTH_PASSWORD_SALT_ROUNDS: 12,
                    AUTH_GOOGLE_ID: "mock google id 2",
                    AUTH_GOOGLE_SECRET: "mock google secret 2",
                    AUTH_FACEBOOK_ID: "mock facebook id 2",
                    AUTH_FACEBOOK_SECRET: "mock facebook secret 2",
                },
            },
        ])("given valid input data $data", ({ data, expected }) => {
            test("should output successfully parsed data", () => {
                const output = EnvSchema.safeParse(data);

                expect(output.data).toEqual(expected);
            });
        });
    });
});
