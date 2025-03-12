import { FooterSkeleton } from "@/components/page/main/skeleton/footer-skeleton";
import { HeaderSkeleton } from "@/components/page/main/skeleton/header-skeleton";
import { PageSkeleton } from "@/components/page/main/skeleton/page-skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/theme/theme-provider");
vi.mock("@/components/page/main/skeleton/header-skeleton");
vi.mock("@/components/page/main/skeleton/footer-skeleton");

const mockedProvider = vi.mocked(ThemeProvider);
const mockedHeaderSkeleton = vi.mocked(HeaderSkeleton);
const mockedFooterSkeleton = vi.mocked(FooterSkeleton);

describe(PageSkeleton, () => {
    beforeEach(() => {
        replaceWithChildren(mockedProvider);
    });

    describe("given no value for 'hideHomeButton' prop", () => {
        test("should use undefined prop value for 'HeaderSkeleton'", () => {
            render(<PageSkeleton />);

            expect(mockedHeaderSkeleton).toHaveBeenCalledOnceWithProps({
                hideHomeButton: undefined,
            });
        });
    });

    describe("given true value for 'hideHomeButton' prop", () => {
        test("should forward prop value to 'HeaderSkeleton'", () => {
            render(<PageSkeleton hideHomeButton />);

            expect(mockedHeaderSkeleton).toHaveBeenCalledOnceWithProps({ hideHomeButton: true });
        });
    });

    describe("given no value for 'hideFooter' prop", () => {
        test("should render footer", () => {
            render(<PageSkeleton />);

            expect(mockedFooterSkeleton).toHaveBeenCalledOnce();
        });
    });

    describe("given true value for 'hideFooter' prop", () => {
        test("should not render footer", () => {
            render(<PageSkeleton hideFooter />);

            expect(mockedFooterSkeleton).not.toHaveBeenCalled();
        });
    });

    test("should render loading spinner inside main tag", () => {
        render(<PageSkeleton />);
        const spinner = screen.queryByRole("status", { name: /loading/i });
        const main = spinner?.closest("main");

        expect(spinner).toBeInTheDocument();
        expect(main).toBeInTheDocument();
    });
});
