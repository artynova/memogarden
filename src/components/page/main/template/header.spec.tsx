import { LimitedTextSpan } from "@/components/limited-text-span";
import { Header } from "@/components/page/main/template/header";
import { HomeButton } from "@/components/page/main/template/home-button";
import { UserDropdown } from "@/components/page/main/template/user-dropdown";
import { SelectUser } from "@/server/data/services/user";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/limited-text-span");
vi.mock("@/components/page/main/template/user-dropdown");
vi.mock("@/components/page/main/template/home-button");

const mockedLimitedTextSpan = vi.mocked(LimitedTextSpan);
const mockedUserDropdown = vi.mocked(UserDropdown);
const mockedHomeButton = vi.mocked(HomeButton);

describe(Header, () => {
    const mockSpanId = "limited-text-span";

    beforeEach(() => {
        mockedLimitedTextSpan.mockReturnValue(<div data-testid={mockSpanId}></div>);
    });

    test("should render 'Home' button by default", () => {
        render(<Header title="" user={fakeCompliantValue()} />);

        expect(mockedHomeButton).toHaveBeenCalledOnce();
    });

    test("should not render 'Home' button when specified to do so", () => {
        render(<Header title="" user={fakeCompliantValue()} hideHomeButton />);

        expect(mockedHomeButton).not.toHaveBeenCalled();
    });

    test.each([
        { title: "Home" },
        { title: "Example title" },
        { title: "Japanese" },
        { title: "Browse" },
    ])(
        `should render title as a limited text span inside a top-level heading when the untrimmed title is $title `,
        ({ title }) => {
            render(<Header title={title} user={fakeCompliantValue()} />);
            const heading = screen.getByTestId(mockSpanId).closest("h1");

            expect(mockedLimitedTextSpan).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ text: title }),
                {},
            );
            expect(heading).toBeInTheDocument();
        },
    );

    test.each([
        { user: { avatarId: 1, retrievability: null } as SelectUser },
        { user: { avatarId: 3, retrievability: 0.01 } as SelectUser },
    ])("should forwared user data to 'UserDropdown' given user data $user", ({ user }) => {
        render(<Header title="" user={user} />);

        expect(mockedUserDropdown).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ user }),
            {},
        );
    });
});
