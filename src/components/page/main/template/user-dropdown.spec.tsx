import { ProfileBadge } from "@/components/page/main/template/profile-badge";
import { SignOutButton } from "@/components/page/main/template/sign-out-button";
import { UserDropdown } from "@/components/page/main/template/user-dropdown";
import { SelectUser } from "@/server/data/services/user";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/page/main/template/profile-badge");
vi.mock("@/components/page/main/template/sign-out-button");

const mockedProfileBadge = vi.mocked(ProfileBadge);
const mockedSignOutButton = vi.mocked(SignOutButton);

describe(UserDropdown, () => {
    beforeEach(() => {
        mockedProfileBadge.mockReturnValue(<div>Profile</div>);
    });

    test.each([
        { user: { avatarId: 1, retrievability: null } as SelectUser },
        { user: { avatarId: 3, retrievability: 0.01 } as SelectUser },
    ])("should forwared user data to 'ProfileBadge' given user data $user", ({ user }) => {
        render(<UserDropdown user={user} />);

        expect(mockedProfileBadge).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ user }),
            {},
        );
    });

    test.each([
        {
            expectedPageName: "Statistics",
            expectedHref: "/statistics",
        },
        {
            expectedPageName: "Account",
            expectedHref: "/account",
        },
    ])(
        `should render dropdown menu with a link to page $expectedPageName at URL $expectedHref}`,
        async ({ expectedPageName, expectedHref }) => {
            render(<UserDropdown user={fakeCompliantValue()} />);
            const trigger = screen.getByRole("button");
            await userEvent.click(trigger);
            const link = screen.queryByRole("link", { name: expectedPageName });

            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", expectedHref);
        },
    );

    test(`should render dropdown menu with a 'Sign out' button`, async () => {
        render(<UserDropdown user={fakeCompliantValue()} />);
        const trigger = screen.queryByRole("button");
        if (trigger) await userEvent.click(trigger);

        expect(trigger).toBeInTheDocument();
        expect(mockedSignOutButton).toHaveBeenCalledOnce();
    });
});
