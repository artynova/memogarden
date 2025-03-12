import { ControlledSelectAvatar } from "@/app/(main)/account/components/controlled-select-avatar";
import { Avatar, AvatarImage } from "@/components/shadcn/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/shadcn/carousel";
import { fakeCompliantValue } from "@/test/mock/generic";
import { replaceWithChildren } from "@/test/mock/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/shadcn/carousel", () => ({
    Carousel: vi.fn(),
    CarouselContent: vi.fn(),
    CarouselItem: vi.fn(),
    CarouselPrevious: vi.fn(),
    CarouselNext: vi.fn(),
}));

vi.mock("@/components/shadcn/avatar", () => ({
    Avatar: vi.fn(),
    AvatarImage: vi.fn(),
    AvatarFallback: vi.fn(),
}));

const mockedCarousel = vi.mocked(Carousel);
const mockedCarouselContent = vi.mocked(CarouselContent);
const mockedCarouselItem = vi.mocked(CarouselItem);
const mockedAvatar = vi.mocked(Avatar);
const mockedAvatarImage = vi.mocked(AvatarImage);

/**
 * Converts avatar ID to expected image relative URL.
 *
 * @param id Avatar ID.
 * @returns Relative URL string.
 */
function avatarIdToSrc(id: number) {
    return `/avatars/${id}.png`;
}

describe(ControlledSelectAvatar, () => {
    const mockApi = {
        on: vi.fn(),
        off: vi.fn(),
        selectedScrollSnap: vi.fn(),
    };

    beforeEach(() => {
        mockedCarousel.mockImplementation(({ setApi, children }) => {
            useEffect(() => {
                setApi?.(fakeCompliantValue(mockApi));
            }, [setApi]);
            return <>{children}</>;
        });
        replaceWithChildren(mockedCarouselContent);
        replaceWithChildren(mockedCarouselItem);
        replaceWithChildren(mockedAvatar);
    });

    describe.each([{ avatars: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }] }])(
        "given avatars $avatars",
        ({ avatars }) => {
            describe.each(
                avatars.map((currentAvatar, currentIndex) => ({ currentAvatar, currentIndex })),
            )("given current avatar $currentAvatar", ({ currentAvatar, currentIndex }) => {
                test("should render image with corresponding src for avatar's carousel snap", () => {
                    render(
                        <ControlledSelectAvatar
                            avatars={avatars}
                            avatarIndex={currentIndex}
                            onAvatarChange={() => {}}
                        />,
                    );

                    expect(mockedAvatarImage).toHaveBeenNthCalledWithProps(currentIndex + 1, {
                        src: avatarIdToSrc(currentAvatar.id),
                    });
                });

                describe.each([...avatars.keys()].map((snapIndex) => ({ snapIndex })))(
                    "given carousel snap index $snapIndex",
                    ({ snapIndex }) => {
                        if (snapIndex === currentIndex) {
                            test("should render selection button as unclickable with appropriate text", () => {
                                render(
                                    <ControlledSelectAvatar
                                        avatars={avatars}
                                        avatarIndex={currentIndex}
                                        onAvatarChange={() => {}}
                                    />,
                                );
                                const button = screen.queryByRole("button", {
                                    name: /selected/i,
                                });

                                expect(button).toBeInTheDocument();
                                expect(button).toBeDisabled();
                            });
                        } else {
                            test("should render selection button as clickable with appropriate text and change handler", async () => {
                                mockApi.selectedScrollSnap.mockImplementation(() => snapIndex);
                                const mockOnAvatarChange = vi.fn();

                                render(
                                    <ControlledSelectAvatar
                                        avatars={avatars}
                                        avatarIndex={currentIndex}
                                        onAvatarChange={mockOnAvatarChange}
                                    />,
                                );
                                const onSelect = mockApi.on.mock.lastCall?.[1] as
                                    | (() => void)
                                    | undefined;
                                onSelect?.(); // Simulate carousel notifying about a change in current snap, and the API will provide snapIndex as the current index due to the selectedScrollSnap mock
                                const button = screen.queryByRole("button", {
                                    name: /select/i,
                                });

                                await waitFor(async () => {
                                    expect(button).toBeInTheDocument();
                                    expect(button).not.toBeDisabled();

                                    await userEvent.click(button!);

                                    expect(mockOnAvatarChange).toHaveBeenCalledExactlyOnceWith(
                                        snapIndex,
                                    );
                                });
                            });
                        }
                    },
                );
            });
        },
    );
});
