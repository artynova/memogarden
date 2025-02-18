import { darkModeToTheme, isThemedSrc, ThemedImageSrc } from "@/lib/ui/theme";
import { StaticImageData } from "next/image";

describe(darkModeToTheme, () => {
    test.each([
        { input: null, expected: "system" },
        { input: false, expected: "light" },
        { input: true, expected: "dark" },
    ])(
        "should return theme name $expected when the dark mode flag is set to $input",
        ({ input, expected }) => {
            const output = darkModeToTheme(input);

            expect(output).toEqual(expected);
        },
    );
});

describe(isThemedSrc, () => {
    test("should return true for themed image source objects", () => {
        const input = {
            light: {} as unknown as StaticImageData, // Actual value here does not matter for the test, as long as it is truthy
            dark: {} as unknown as StaticImageData,
        } satisfies ThemedImageSrc;

        const output = isThemedSrc(input);

        expect(output).toEqual(true);
    });

    test("should return true for regular static image imports", () => {
        const input = undefined as unknown as StaticImageData;

        const output = isThemedSrc(input);

        expect(output).toEqual(false);
    });
});
