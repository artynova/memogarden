import { darkModeToTheme, isThemedSrc, ThemedImageSrc } from "@/lib/ui/theme";
import { fakeCompliantValue } from "@/test/mock/generic";
import { StaticImageData } from "next/image";
import { describe, expect, test } from "vitest";

describe(darkModeToTheme, () => {
    describe.each([
        { input: null, expected: "system" },
        { input: false, expected: "light" },
        { input: true, expected: "dark" },
    ])("given dark mode flag value $input", ({ input, expected }) => {
        test(`should return theme name ${expected}`, () => {
            const output = darkModeToTheme(input);

            expect(output).toEqual(expected);
        });
    });
});

describe(isThemedSrc, () => {
    describe.each([
        {
            input: {
                light: fakeCompliantValue<StaticImageData>(), // Actual value here does not matter for the test, as long as it is truthy
                dark: fakeCompliantValue<StaticImageData>(),
            } satisfies ThemedImageSrc,
        },
        {
            input: {
                light: fakeCompliantValue<StaticImageData>("light"),
                dark: fakeCompliantValue<StaticImageData>("dark"),
            } satisfies ThemedImageSrc,
        },
    ])("given themed image source $input", ({ input }) => {
        test("should return true", () => {
            const output = isThemedSrc(input);

            expect(output).toEqual(true);
        });
    });

    describe.each([
        { input: fakeCompliantValue<StaticImageData>() },
        { input: fakeCompliantValue<StaticImageData>("image") },
    ])("given single static image source $input", ({ input }) => {
        test("should return false", () => {
            const output = isThemedSrc(input);

            expect(output).toEqual(false);
        });
    });
});
