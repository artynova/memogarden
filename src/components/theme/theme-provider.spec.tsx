import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { replaceWithChildren } from "@/test/mock/react";

vi.mock("next-themes");

const mockedNextThemesProvider = vi.mocked(NextThemesProvider);
const mockedUseTheme = vi.mocked(useTheme);

describe.each([
    { theme: undefined },
    { theme: "light" as const },
    { theme: "dark" as const },
    { theme: "system" as const },
])(ThemeProvider, ({ theme }) => {
    const mockSetTheme = vi.fn();

    beforeEach(() => {
        replaceWithChildren(mockedNextThemesProvider);
        mockedUseTheme.mockReturnValue({ setTheme: mockSetTheme, themes: [] });
    });

    test(`should forward theme value to next-themes theme provider given theme value '${theme}'`, () => {
        render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

        expect(mockedNextThemesProvider).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ forcedTheme: theme }),
            {},
        );
    });

    if (theme) {
        test(`should store theme value in local storage by default given theme value '${theme}'`, () => {
            render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

            expect(mockSetTheme).toHaveBeenCalledExactlyOnceWith(theme);
        });
    } else {
        test(`should not store theme value in local storage by default given theme value '${theme}'`, () => {
            render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

            expect(mockSetTheme).not.toHaveBeenCalled();
        });
    }

    test(`should not store theme value in local storage when requested to do so given theme value '${theme}'`, () => {
        render(
            <ThemeProvider theme={theme} doNotPersistTheme>
                Content
            </ThemeProvider>,
        );

        expect(mockSetTheme).not.toHaveBeenCalled();
    });

    test.each([{ contentText: "Content" }, { contentText: "Page" }])(
        `should correctly render content given content as a div with text $contentText`,
        ({ contentText }) => {
            render(
                <ThemeProvider theme={theme}>
                    <div>{contentText}</div>
                </ThemeProvider>,
            );
            const div = screen.queryByText(contentText);

            expect(div).toBeInTheDocument();
        },
    );
});
