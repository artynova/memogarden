import { Header } from "@/components/page/static/header";
import { Footer } from "@/components/page/static/footer";
import { PageTemplate } from "@/components/page/static/page-template";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";

vi.mock("@/components/theme/theme-provider");
vi.mock("@/components/page/static/header");
vi.mock("@/components/page/static/footer");

const mockedProvider = vi.mocked(ThemeProvider);
const mockedHeader = vi.mocked(Header);
const mockedFooter = vi.mocked(Footer);

describe(PageTemplate, () => {
    beforeEach(() => {
        mockedProvider.mockImplementation(({ children }) => <>{children}</>); // So that the content of the provider still renders
    });

    test("should contain a header", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedHeader).toHaveBeenCalledOnce();
    });

    test("should contain a footer", () => {
        render(<PageTemplate>Content</PageTemplate>);

        expect(mockedFooter).toHaveBeenCalledOnce();
    });

    test("should contain a main tag with content", () => {
        render(<PageTemplate>Content</PageTemplate>);
        const main = screen.getByText("Content");

        expect(main.tagName).toEqual("MAIN");
    });

    test("should initialize the theme with value 'system' and directive not to persist the value", () => {
        render(<PageTemplate>Content</PageTemplate>);
        expect(mockedProvider).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                theme: "system",
                doNotPersistTheme: true,
            }),
            {},
        );
    });
});
