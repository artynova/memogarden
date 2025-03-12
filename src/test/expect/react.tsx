import { Mock, expect } from "vitest";
import util from "util";

declare module "vitest" {
    interface Assertion<T> {
        /**
         * Asserts that a React component mock function was called once and provided with at least the given props.
         *
         * @param expectedProps Minimum expected props. The assertion will not fail as long as these props (with expected values) are present
         * in the call to the mock. Other props may be present in the call as well.
         */
        toHaveBeenCalledOnceWithProps(expectedProps: Record<string, unknown>): T;

        /**
         * Asserts that a React component mock function was called at least once and provided with at least the given props on the last call.
         *
         * @param expectedProps Minimum expected props. The assertion will not fail as long as these props (with expected values) are present
         * in the last call to the mock. Other props may be present in the call as well.
         */
        toHaveBeenLastCalledWithProps(expectedProps: Record<string, unknown>): T;

        /**
         * Asserts that a React component mock function was called at least {@link index} times and provided with at least the given props on the
         * call at index {@link index} (1-based, e.g., 1 would refer to the first call).
         *
         * @param index Index of the call (1-based).
         * @param expectedProps Minimum expected props. The assertion will not fail as long as these props (with expected values) are present
         * in the corresponding call to the mock. Other props may be present in the call as well.
         */
        toHaveBeenNthCalledWithProps(index: number, expectedProps: Record<string, unknown>): T;

        /**
         * Asserts that a React component mock function was called at least once and provided with at least the given props on at least one call.
         *
         * @param expectedProps Minimum expected props. The assertion will not fail as long as these props (with expected values) are present
         * in at least one call to the mock. Other props may be present in the call as well.
         */
        toHaveBeenCalledWithProps(expectedProps: Record<string, unknown>): T;
    }
}

function propsInclude(actualProps: object, expectedProps: Record<string, unknown>) {
    return (
        expect.objectContaining(expectedProps) as {
            asymmetricMatch: (value: unknown) => boolean;
        }
    ).asymmetricMatch(actualProps);
}

function checkPropsInclude(actualProps: object, expectedProps: Record<string, unknown>) {
    const pass = propsInclude(actualProps, expectedProps);
    return {
        pass,
        message: () =>
            pass
                ? "Expected mock not to have been called with matching props, but it was."
                : `Expected mock to be called with props matching ${util.inspect(expectedProps)}, but received ${util.inspect(actualProps)}`,
    };
}

expect.extend({
    toHaveBeenCalledOnceWithProps(received: Mock, expectedProps: Record<string, unknown>) {
        if (!received?.mock) {
            return {
                pass: false,
                message: () => `Expected a mock function, but received ${typeof received}`,
            };
        }

        const calls = received.mock.calls;

        if (calls.length !== 1) {
            return {
                pass: false,
                message: () =>
                    `Expected mock to be called exactly once, but it was called ${calls.length} times`,
            };
        }

        const actualProps = calls[0][0] as object;
        return checkPropsInclude(actualProps, expectedProps);
    },

    toHaveBeenLastCalledWithProps(received: Mock, expectedProps: Record<string, unknown>) {
        if (!received?.mock) {
            return {
                pass: false,
                message: () => `Expected a mock function, but received ${typeof received}`,
            };
        }

        const calls = received.mock.calls;

        if (calls.length < 1) {
            return {
                pass: false,
                message: () =>
                    `Expected mock to be called at least once, but it was called ${calls.length} times`,
            };
        }

        const actualProps = calls[calls.length - 1][0] as object;
        return checkPropsInclude(actualProps, expectedProps);
    },

    toHaveBeenNthCalledWithProps(
        received: Mock,
        index: number,
        expectedProps: Record<string, unknown>,
    ) {
        if (!received?.mock) {
            return {
                pass: false,
                message: () => `Expected a mock function, but received ${typeof received}`,
            };
        }

        const calls = received.mock.calls;

        if (calls.length < index) {
            return {
                pass: false,
                message: () =>
                    `Expected mock to be called at least ${index} times, but it was called ${calls.length} times`,
            };
        }

        const actualProps = calls[index - 1][0] as object;
        return checkPropsInclude(actualProps, expectedProps);
    },

    toHaveBeenCalledWithProps(received: Mock, expectedProps: Record<string, unknown>) {
        if (!received?.mock) {
            return {
                pass: false,
                message: () => `Expected a mock function, but received ${typeof received}`,
            };
        }

        const calls = received.mock.calls;

        if (calls.length < 1) {
            return {
                pass: false,
                message: () =>
                    `Expected mock to be called at least once, but it was called ${calls.length} times`,
            };
        }

        for (const call of calls) {
            const actualProps = call[0] as object;
            if (propsInclude(actualProps, expectedProps))
                return {
                    pass: true,
                    message: () =>
                        `Expected mock not to have been called with matching props, but it was.`,
                };
        }
        return {
            pass: false,
            message: () =>
                `Expected mock to be called with props matching ${util.inspect(expectedProps)} at least once, but it was called 0 times with matching props`,
        };
    },
});
