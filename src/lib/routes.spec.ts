import { NextURL } from "next/dist/server/web/next-url";
import { shouldAllowWithoutToken, shouldAllowWithToken } from "@/lib/routes";

describe(shouldAllowWithoutToken, () => {
    it.each([
        { route: "/signin" },
        { route: "/signup" },
        { route: "/" },
        { route: "/non-existent-route" },
    ])("should allow route $route", ({ route }) => {
        const input = new NextURL(`http://localhost${route}`);

        const output = shouldAllowWithoutToken(input);

        expect(output).toEqual(true);
    });

    it.each([
        { route: "/home" },
        { route: "/account" },
        { route: "/statistics" },
        { route: "/browse" },
        { route: "/card/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa" },
        { route: "/deck/5438b458-e521-4b0c-9657-5795fc6b52fa/review" },
    ])("should not allow protected route $route", ({ route }) => {
        const input = new NextURL(`http://localhost${route}`);

        const output = shouldAllowWithoutToken(input);

        expect(output).toEqual(false);
    });
});

describe(shouldAllowWithToken, () => {
    it.each([
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
    ])("should allow route $route", ({ route }) => {
        const input = new NextURL(`http://localhost${route}`);

        const output = shouldAllowWithToken(input);

        expect(output).toEqual(true);
    });

    it.each([{ route: "/signin" }, { route: "/signup" }])(
        "should not allow route $route",
        ({ route }) => {
            const input = new NextURL(`http://localhost${route}`);

            const output = shouldAllowWithToken(input);

            expect(output).toEqual(false);
        },
    );
});
