import { Header } from "@/components/page/static/header";
import { Footer } from "@/components/page/static/footer";
import { PageTemplate } from "@/components/page/static/page-template";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { replaceWithChildren } from "@/test/mock/react";

vi.mock("@/components/theme/theme-provider");
vi.mock("@/components/page/static/header");
vi.mock("@/components/page/static/footer");

const mockedProvider = vi.mocked(ThemeProvider);
const mockedHeader = vi.mocked(Header);
const mockedFooter = vi.mocked(Footer);

describe(PageTemplate, () => {
    beforeEach(() => {
        replaceWithChildren(mockedProvider);
    });

    test("should contain header", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedHeader).toHaveBeenCalledOnce();
    });

    test("should contain footer", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedFooter).toHaveBeenCalledOnce();
    });

    test("should use semantic main tag with content", () => {
        const contentTestId = "mock-content";

        render(
            <PageTemplate>
                <div data-testid={contentTestId} />
            </PageTemplate>,
        );
        const main = screen.getByTestId(contentTestId).closest("main");

        expect(main).toBeInTheDocument();
    });

    test("should initialize theme with value 'system'", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedProvider).toHaveBeenCalledOnceWithProps({ theme: "system" });
    });

    test("should not persist theme in local storage", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedProvider).toHaveBeenCalledOnceWithProps({ doNotPersistTheme: true });
    });
});
