import { Header } from "@/components/page/main/template/header";
import { Footer } from "@/components/page/main/template/footer";
import { PageTemplate } from "@/components/page/main/template/page-template";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { fakeCompliantValue } from "@/test/mock/generic";
import { SelectUser } from "@/server/data/services/user";
import { Frown, Meh, Plus, Smile, Trash } from "lucide-react";
import { replaceWithChildren } from "@/test/mock/react";

vi.mock("@/components/theme/theme-provider");
vi.mock("@/components/page/main/template/header");
vi.mock("@/components/page/main/template/footer");

const mockedProvider = vi.mocked(ThemeProvider);
const mockedHeader = vi.mocked(Header);
const mockedFooter = vi.mocked(Footer);

describe(PageTemplate, () => {
    beforeEach(() => {
        replaceWithChildren(mockedProvider);
    });

    describe.each([
        { darkMode: true, theme: "dark" },
        { darkMode: false, theme: "light" },
        { darkMode: null, theme: "system" },
    ])("given boolean dark mode flag value $darkMode", ({ darkMode, theme }) => {
        test(`should initialize theme with value ${theme}`, () => {
            render(
                <PageTemplate title="" user={fakeCompliantValue({ darkMode })}>
                    Content
                </PageTemplate>,
            );

            expect(mockedProvider).toHaveBeenCalledOnceWithProps({ theme });
        });
    });

    describe.each([
        {
            title: "Home",
            user: { avatarId: 1, retrievability: null } as SelectUser,
            hideHomeButton: true,
        },
        {
            title: "Browse",
            user: { avatarId: 0, retrievability: 0.5 } as SelectUser,
        },
        {
            title: "German",
            user: { avatarId: 1, retrievability: 0.96 } as SelectUser,
        },
        {
            title: "SQL",
            user: { avatarId: 3, retrievability: 0.6 } as SelectUser,
            hideHomeButton: true,
        },
    ])(
        "given title $title, user data $user, and 'hideHomeButton' prop value $hideHomeButton",
        ({ title, user, hideHomeButton }) => {
            test("should forward title to 'Header'", () => {
                render(
                    <PageTemplate title={title} user={user} hideHomeButton={hideHomeButton}>
                        Content
                    </PageTemplate>,
                );

                expect(mockedHeader).toHaveBeenCalledOnceWithProps({ title });
            });
            test("should forward user data to 'Header'", () => {
                render(
                    <PageTemplate title={title} user={user} hideHomeButton={hideHomeButton}>
                        Content
                    </PageTemplate>,
                );

                expect(mockedHeader).toHaveBeenCalledOnceWithProps({ user });
            });
            test("should forward 'hideHomeButton' prop value to 'Header'", () => {
                render(
                    <PageTemplate title={title} user={user} hideHomeButton={hideHomeButton}>
                        Content
                    </PageTemplate>,
                );

                expect(mockedHeader).toHaveBeenCalledOnceWithProps({ hideHomeButton });
            });
        },
    );

    describe("given no footer action list", () => {
        test("should not render 'Footer'", () => {
            render(
                <PageTemplate title="" user={fakeCompliantValue()}>
                    Content
                </PageTemplate>,
            );

            expect(mockedFooter).not.toHaveBeenCalled();
        });
    });

    describe.each([
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
    ])("given footer actions $footerActions", ({ footerActions }) => {
        test("should forward actions to 'Footer'", () => {
            render(
                <PageTemplate title="" user={fakeCompliantValue()} footerActions={footerActions}>
                    Content
                </PageTemplate>,
            );

            expect(mockedFooter).toHaveBeenCalledOnceWithProps({ actions: footerActions });
        });
    });

    test("should use semantic main tag with content", () => {
        const contentTestId = "mock-content";

        render(
            <PageTemplate title="" user={fakeCompliantValue()}>
                <div data-testid={contentTestId} />
            </PageTemplate>,
        );
        const main = screen.getByTestId(contentTestId).closest("main");

        expect(main).toBeInTheDocument();
    });
});
