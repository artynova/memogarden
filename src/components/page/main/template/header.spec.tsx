import { LimitedTextSpan } from "@/components/limited-text-span";
import { Header } from "@/components/page/main/template/header";
import { HomeButton } from "@/components/page/main/template/home-button";
import { UserDropdown } from "@/components/page/main/template/user-dropdown";
import { SelectUser } from "@/server/data/services/user";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/limited-text-span");
vi.mock("@/components/page/main/template/user-dropdown");
vi.mock("@/components/page/main/template/home-button");

const mockedLimitedTextSpan = vi.mocked(LimitedTextSpan);
const mockedUserDropdown = vi.mocked(UserDropdown);
const mockedHomeButton = vi.mocked(HomeButton);

describe(Header, () => {
    describe("given no value for 'hideHomeButton' prop", () => {
        test("should render 'Home' button", () => {
            render(<Header title="" user={fakeCompliantValue()} />);

            expect(mockedHomeButton).toHaveBeenCalledOnce();
        });
    });

    describe("given true value for 'hideHomeButton' prop", () => {
        test("should not render 'Home' button", () => {
            render(<Header title="" user={fakeCompliantValue()} hideHomeButton />);

            expect(mockedHomeButton).not.toHaveBeenCalled();
        });
    });

    describe.each([
        { title: "Home" },
        { title: "Example title" },
        { title: "Japanese" },
        { title: "Browse" },
    ])("given title $title", ({ title }) => {
        test("should forward title to 'LimitedTextSpan'", () => {
            render(<Header title={title} user={fakeCompliantValue()} />);

            expect(mockedLimitedTextSpan).toHaveBeenCalledOnceWithProps({ text: title });
        });

        test("should render title in first-level heading", () => {
            const mockSpanTestId = "limited-text-span";
            mockedLimitedTextSpan.mockReturnValue(<div data-testid={mockSpanTestId} />);

            render(<Header title={title} user={fakeCompliantValue()} />);
            const heading = screen.getByTestId(mockSpanTestId).closest("h1");

            expect(heading).toBeInTheDocument();
        });
    });

    describe.each([
        { user: { avatarId: 1, retrievability: null } as SelectUser },
        { user: { avatarId: 3, retrievability: 0.01 } as SelectUser },
    ])("given user data $user", ({ user }) => {
        test("should forwared user data to 'UserDropdown'", () => {
            render(<Header title="" user={user} />);

            expect(mockedUserDropdown).toHaveBeenCalledOnceWithProps({ user });
        });
    });
});
