import { MissingTimezoneHandler } from "@/app/(main)/home/components/missing-timezone-handler";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, waitFor } from "@testing-library/react";
import { updateUser } from "@/server/actions/user/actions";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SelectUser } from "@/server/data/services/user";

vi.mock("@/server/actions/user/actions");
vi.mock("next/navigation");

const mockedUpdateUser = vi.mocked(updateUser);
const mockedUseRouter = vi.mocked(useRouter);

describe(MissingTimezoneHandler, () => {
    const mockRouterRefresh = vi.fn();

    beforeEach(() => {
        mockedUseRouter.mockReturnValue(fakeCompliantValue({ refresh: mockRouterRefresh }));
    });

    describe.each([{ timezone: "Europe/Warsaw" }, { timezone: "America/New_York" }])(
        "given inferred timezone $timezone on the client",
        ({ timezone }) => {
            beforeEach(() => {
                vi.spyOn(Intl, "DateTimeFormat").mockReturnValue(
                    fakeCompliantValue({
                        resolvedOptions: () => ({
                            timeZone: timezone,
                        }),
                    }),
                );
            });

            describe("given user with missing timezone", () => {
                const mockUser = { timezone: null, avatarId: 1, darkMode: true } as SelectUser;

                test("should trigger 'updateUser' server action with the inferred timezone", () => {
                    render(<MissingTimezoneHandler user={mockUser} />);

                    expect(mockedUpdateUser).toHaveBeenCalledExactlyOnceWith(
                        expect.objectContaining({ ...mockUser, timezone }),
                    );
                });

                test("should refresh current page", async () => {
                    render(<MissingTimezoneHandler user={mockUser} />);

                    await waitFor(() => {
                        expect(mockRouterRefresh).toHaveBeenCalledOnce();
                    });
                });
            });

            describe("given user with present timezone 'Europe/Warsaw'", () => {
                const mockUser = {
                    timezone: "Europe/Warsaw",
                    avatarId: 2,
                    darkMode: false,
                } as SelectUser;

                test("should not trigger 'updateUser' server action", () => {
                    render(<MissingTimezoneHandler user={mockUser} />);

                    expect(mockedUpdateUser).not.toHaveBeenCalled();
                });
            });
        },
    );

    test("should not render any DOM elements", () => {
        const { container } = render(<MissingTimezoneHandler user={fakeCompliantValue()} />);

        expect(container).toBeEmptyDOMElement();
    });
});
