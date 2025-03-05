import { Mock, expect } from "vitest";

declare module "vitest" {
    interface Assertion<T> {
        /**
         * Asserts that a React component mock function was called once and provided with at least the given props.
         *
         * @param expectedProps Minimum expected props. The assertion will not fail as long as these props (with expected values) are present
         * in the call to the mock. Other props may be present in the call as well.
         */
        toHaveBeenCalledOnceWithProps(expectedProps: Record<string, unknown>): T;
    }
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
        const pass = (
            expect.objectContaining(expectedProps) as {
                asymmetricMatch: (value: unknown) => boolean;
            }
        ).asymmetricMatch(actualProps);

        return {
            pass,
            message: () =>
                pass
                    ? `Expected mock not to have been called with matching props, but it was.`
                    : `Expected mock to be called with props matching ${JSON.stringify(expectedProps)}, but received ${JSON.stringify(actualProps)}`,
        };
    },
});
