import { Header } from "@/components/page/main/template/header";
import { Footer } from "@/components/page/main/template/footer";
import { PageTemplate } from "@/components/page/main/template/page-template";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { fakeCompliantValue } from "@/test/mock/generic";
import { SelectUser } from "@/server/data/services/user";
import { Frown, Meh, Plus, Smile, Trash } from "lucide-react";

vi.mock("@/components/theme/theme-provider");
vi.mock("@/components/page/main/template/header");
vi.mock("@/components/page/main/template/footer");

const mockedProvider = vi.mocked(ThemeProvider);
const mockedHeader = vi.mocked(Header);
const mockedFooter = vi.mocked(Footer);

describe(PageTemplate, () => {
    beforeEach(() => {
        mockedProvider.mockImplementation(({ children }) => <>{children}</>); // So that the content of the provider still renders
    });

    test.each([
        { darkMode: true, theme: "dark" },
        { darkMode: false, theme: "light" },
        { darkMode: null, theme: "system" },
    ])(
        "should initialize the theme with value $theme when user object has the darkMode flag set to $darkMode",
        ({ darkMode, theme }) => {
            render(
                <PageTemplate title="" user={fakeCompliantValue({ darkMode })}>
                    Content
                </PageTemplate>,
            );
            expect(mockedProvider).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    theme: theme,
                }),
                {},
            );
        },
    );

    test.each([
        {
            headerProps: {
                title: "Home",
                user: { avatarId: 1, retrievability: null } as SelectUser,
                hideHomeButton: true,
            },
        },
        {
            headerProps: {
                title: "Browse",
                user: { avatarId: 0, retrievability: 0.5 } as SelectUser,
            },
        },
        {
            headerProps: {
                title: "German",
                user: { avatarId: 1, retrievability: 0.96 } as SelectUser,
            },
        },
        {
            headerProps: {
                title: "SQL",
                user: { avatarId: 3, retrievability: 0.6 } as SelectUser,
                hideHomeButton: true,
            },
        },
    ])(
        "should forward header properties to 'Header' when given header properties $headerProps",
        ({ headerProps }) => {
            render(<PageTemplate {...headerProps}>Content</PageTemplate>);

            expect(mockedHeader).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ ...headerProps }),
                {},
            );
        },
    );

    test("should avoid rendering the footer when no footer actions are passed", () => {
        render(
            <PageTemplate title="" user={fakeCompliantValue()}>
                Content
            </PageTemplate>,
        );

        expect(mockedFooter).not.toHaveBeenCalled();
    });

    test.each([
        {
            footerActions: [
                { Icon: Trash, text: "Delete", action: "/delete" },
                { Icon: Plus, text: "Create", action: () => {} },
            ],
        },
        {
            footerActions: [
                { Icon: Frown, text: "Bad", action: () => {} },
                { Icon: Meh, text: "Okay", action: () => {} },
                { Icon: Smile, text: "Good", action: () => {} },
            ],
        },
    ])(
        "should forward footer actions to 'Footer' when the actions array is given and is $footerActions",
        ({ footerActions }) => {
            render(
                <PageTemplate title="" user={fakeCompliantValue()} footerActions={footerActions}>
                    Content
                </PageTemplate>,
            );

            expect(mockedFooter).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ actions: footerActions }),
                {},
            );
        },
    );

    test("should contain a main tag with content", () => {
        render(
            <PageTemplate title="" user={fakeCompliantValue()}>
                Content
            </PageTemplate>,
        );
        const main = screen.getByText("Content");

        expect(main.tagName).toEqual("MAIN");
    });
});
