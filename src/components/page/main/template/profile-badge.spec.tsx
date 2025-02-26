import { ProfileBadge } from "@/components/page/main/template/profile-badge";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { AvatarImage } from "@/components/shadcn/avatar";
import { SelectUser } from "@/server/data/services/user";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/resource/bars/health-bar");
vi.mock("@/components/shadcn/avatar", async (importOriginal) => {
    const original: object = await importOriginal();
    return { ...original, AvatarImage: vi.fn() };
});

const mockedHealthBar = vi.mocked(HealthBar);
const mockedAvatarImage = vi.mocked(AvatarImage);

describe.each([
    { user: { avatarId: 1, retrievability: null } as SelectUser },
    { user: { avatarId: 0, retrievability: 0 } as SelectUser },
    { user: { avatarId: 3, retrievability: 0.01 } as SelectUser },
    { user: { avatarId: 2, retrievability: 0.5 } as SelectUser },
    { user: { avatarId: 0, retrievability: 1 } as SelectUser },
])(ProfileBadge, ({ user }) => {
    test(`should forward correct retrievability value to user health bar when retrievability is ${user.retrievability}`, () => {
        render(<ProfileBadge user={user} />);

        expect(mockedHealthBar).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ retrievability: user.retrievability }),
            {},
        );
    });

    test(`should render user avatar image with correct src when avatar ID is ${user.avatarId}`, () => {
        const expectedSrc = `/avatars/${user.avatarId}.png`;

        render(<ProfileBadge user={user} />);

        expect(mockedAvatarImage).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ src: expectedSrc }),
            {},
        );
    });
});
