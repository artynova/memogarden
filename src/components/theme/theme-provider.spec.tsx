import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { replaceWithChildren } from "@/test/mock/react";

vi.mock("next-themes");

const mockedNextThemesProvider = vi.mocked(NextThemesProvider);
const mockedUseTheme = vi.mocked(useTheme);

describe(ThemeProvider, () => {
    const mockSetTheme = vi.fn();

    beforeEach(() => {
        replaceWithChildren(mockedNextThemesProvider);
        mockedUseTheme.mockReturnValue({ setTheme: mockSetTheme, themes: [] });
    });

    describe.each([
        { theme: undefined },
        { theme: "light" as const },
        { theme: "dark" as const },
        { theme: "system" as const },
    ])("given theme value $theme", ({ theme }) => {
        test("should forward theme value to next-themes theme provider", () => {
            render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

            expect(mockedNextThemesProvider).toHaveBeenCalledOnceWithProps({ forcedTheme: theme });
        });

        describe("given no value for 'doNotPersistTheme' prop", () => {
            if (theme) {
                test("should store theme value in local storage", () => {
                    render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

                    expect(mockSetTheme).toHaveBeenCalledExactlyOnceWith(theme);
                });
            } else {
                test("should not store theme value in local storage", () => {
                    render(<ThemeProvider theme={theme}>Content</ThemeProvider>);

                    expect(mockSetTheme).not.toHaveBeenCalled();
                });
            }
        });

        describe("given true value for 'doNotPersistTheme' prop", () => {
            test("should not store theme value in local storage", () => {
                render(
                    <ThemeProvider theme={theme} doNotPersistTheme>
                        Content
                    </ThemeProvider>,
                );

                expect(mockSetTheme).not.toHaveBeenCalled();
            });
        });

        describe.each([
            { children: <span data-testid="mock-1">Content</span>, contentTestId: "mock-1" },
            { children: <div data-testid="mock-2">Page</div>, contentTestId: "mock-2" },
        ])("given children $children", ({ children, contentTestId }) => {
            test(`should render children inside next-themes provider`, () => {
                render(<ThemeProvider theme={theme}>{children}</ThemeProvider>);
                const content = screen.queryByTestId(contentTestId);

                expect(content).toBeInTheDocument();
            });
        });
    });
});
