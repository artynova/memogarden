import { PageSkeleton } from "@/components/page/main/skeleton/page-skeleton";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/theme/theme-provider");

const mockedProvider = vi.mocked(ThemeProvider);

describe(PageSkeleton, () => {
    beforeEach(() => {
        mockedProvider.mockImplementation(({ children }) => <>{children}</>);
    });

    test("should render 'Home' button by default", () => {
        render(<PageSkeleton />);
        const link = screen.queryByText(/home/i);

        expect(link).toBeInTheDocument();
    });

    test("should not render 'Home' button when directed to avoid it", () => {
        render(<PageSkeleton hideHomeButton />);
        const link = screen.queryByText(/home/i);

        expect(link).not.toBeInTheDocument();
    });

    test("should render footer by default", () => {
        const { container } = render(<PageSkeleton />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(1);
    });

    test("should avoid rendering the footer when specified to do so", () => {
        const { container } = render(<PageSkeleton hideFooter />);
        const footers = container.getElementsByTagName("footer");

        expect(footers.length).toEqual(0);
    });

    test("should render loading spinner inside the main tag", () => {
        render(<PageSkeleton />);
        const spinner = screen.queryByRole("status", { name: /loading/i });
        const main = spinner?.closest("main");

        expect(spinner).toBeInTheDocument();
        expect(main).toBeInTheDocument();
    });
});
