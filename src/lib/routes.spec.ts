import { NextURL } from "next/dist/server/web/next-url";
import { shouldAllowWithoutToken, shouldAllowWithToken } from "@/lib/routes";
import { describe, expect, test } from "vitest";

describe(shouldAllowWithoutToken, () => {
    describe.each([
        { route: "/signin" },
        { route: "/signup" },
        { route: "/" },
        { route: "/non-existent-route" },
    ])("given unprotected route $route", ({ route }) => {
        test("should allow route", () => {
            const input = new NextURL(`http://localhost${route}`);

            const output = shouldAllowWithoutToken(input);

            expect(output).toEqual(true);
        });
    });

    describe.each([
        { route: "/home" },
        { route: "/account" },
        { route: "/statistics" },
        { route: "/browse" },
        { route: "/card/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa/review" },
    ])("given protected route $route", ({ route }) => {
        test("should not allow route", () => {
            const input = new NextURL(`http://localhost${route}`);

            const output = shouldAllowWithoutToken(input);

            expect(output).toEqual(false);
        });
    });
});

describe(shouldAllowWithToken, () => {
    describe.each([
        { route: "/" },
        { route: "/signin?invalidToken" },
        { route: "/home" },
        { route: "/account" },
        { route: "/statistics" },
        { route: "/browse" },
        { route: "/card/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa/review" },
        { route: "/non-existent-route" },
    ])("given non-guest-specific route $route", ({ route }) => {
        test("should allow route", () => {
            const input = new NextURL(`http://localhost${route}`);

            const output = shouldAllowWithToken(input);

            expect(output).toEqual(true);
        });
    });

    describe.each([{ route: "/signin" }, { route: "/signup" }])(
        "given guest-specific route $route",
        ({ route }) => {
            test("should not allow route $route", () => {
                const input = new NextURL(`http://localhost${route}`);

                const output = shouldAllowWithToken(input);

                expect(output).toEqual(false);
            });
        },
    );
});
