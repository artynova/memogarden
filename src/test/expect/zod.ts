import { expect } from "vitest";
import util from "util";
import { SafeParseReturnType } from "zod";

declare module "vitest" {
    interface Assertion<T> {
        /**
         * Asserts that a Zod safe parsing output has at least one error for the given field and that the error's message exactly matches the provided one.
         *
         * @param path Field path in the schema.
         * @param message Expected first error message (there may be other messages after it).
         */
        toHaveFirstParsingError(path: string, message: string): T;

        /**
         * Asserts that a Zod safe parsing output has at least one error for the given field.
         *
         * @param path Field path in the schema.
         */
        toHaveParsingErrors(path: string): T;
    }
}

expect.extend({
    toHaveFirstParsingError(
        received: SafeParseReturnType<unknown, unknown>,
        path: string,
        message: string,
    ) {
        const errors = received?.error?.errors;
        if (!Array.isArray(errors))
            return {
                pass: false,
                message: () =>
                    `Expected a safe parsing output, but received ${util.inspect(received)}`,
            };
        if (errors.length < 1)
            return {
                pass: false,
                message: () =>
                    "Expected a safe parsing output with errors, but received a successful parsing output",
            };
        const pathErrors = errors.filter((error) => error.path.includes(path));
        if (pathErrors.length < 1)
            return {
                pass: false,
                message: () =>
                    `Expected a safe parsing output with errors for field '${path}', but received an output without errors for that field`,
            };
        const error = pathErrors[0];
        const pass = error.message === message;
        return {
            pass,
            message: () =>
                pass
                    ? `Expected parsing output's first error for field '${path}' not to have message '${message}', but it did`
                    : `Expected parsing output's first error for field '${path}' to have message '${message}', but it did not`,
        };
    },

    toHaveParsingErrors(received: SafeParseReturnType<unknown, unknown>, path: string) {
        const errors = received?.error?.errors;
        if (!Array.isArray(errors))
            return {
                pass: false,
                message: () =>
                    `Expected a safe parsing output, but received ${util.inspect(received)}`,
            };
        if (errors.length < 1)
            return {
                pass: false,
                message: () =>
                    "Expected a safe parsing output with errors, but received a successful parsing output",
            };
        const pathErrors = errors.filter((error) => error.path.includes(path));
        const pass = pathErrors.length > 0;
        return {
            pass,
            message: () =>
                pass
                    ? `Expected a safe parsing output without errors for field '${path}', but received an output with errors for that field`
                    : `Expected a safe parsing output with errors for field '${path}', but received an output without errors for that field`,
        };
    },
});
