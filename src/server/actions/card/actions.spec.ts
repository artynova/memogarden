import { ReviewRating } from "@/lib/enums";
import { Response, ResponseBadRequest, ResponseNotFound } from "@/lib/responses";
import { getDayEnd } from "@/lib/utils/generic";
import { getUserIdOrRedirect, getUserOrRedirect } from "@/lib/utils/server";
import {
    createNewCard,
    deleteCard,
    reviewCardWithRating,
    updateCard,
} from "@/server/actions/card/actions";
import {
    createCard,
    editCard,
    isCardAccessible,
    removeCard,
    reviewCard,
} from "@/server/data/services/card";
import { isDeckAccessible } from "@/server/data/services/deck";
import { SelectUser } from "@/server/data/services/user";
import { fakeCompliantValue } from "@/test/mock/generic";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/utils/server");
vi.mock("@/server/data/services/deck");
vi.mock("@/server/data/services/card");

const mockedGetUserIdOrRedirect = vi.mocked(getUserIdOrRedirect);
const mockedIsDeckAccessible = vi.mocked(isDeckAccessible);
const mockedCreateCard = vi.mocked(createCard);
const mockedIsCardAccessible = vi.mocked(isCardAccessible);
const mockedEditCard = vi.mocked(editCard);
const mockedRemoveCard = vi.mocked(removeCard);
const mockedGetUserOrRedirect = vi.mocked(getUserOrRedirect);
const mockedReviewCard = vi.mocked(reviewCard);

describe(createNewCard, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await createNewCard(fakeCompliantValue(data));

                expect((result as Response).status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        { data: { deckId: "deck1", front: "_Hello_", back: "H**a**llo" } },
        { data: { deckId: "deck2", front: "1. lorem", back: "2. ipsum" } },
    ])("given valid data $data", ({ data }) => {
        describe.each([{ userId: "user1" }, { userId: "user2" }])(
            "given current user's ID is $userId",
            ({ userId }) => {
                test("should check target deck accessibility for current user", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                    await createNewCard(data);

                    expect(mockedIsDeckAccessible).toHaveBeenCalledExactlyOnceWith(
                        userId,
                        data.deckId,
                    );
                });

                describe("given target deck is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(false);

                        const result = await createNewCard(data);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given target deck is accessible to user", () => {
                    test("should call 'createCard' with card data", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(true);

                        await createNewCard(data);

                        expect(mockedCreateCard).toHaveBeenCalledExactlyOnceWith(data);
                    });

                    describe.each([{ id: "card1" }, { id: "card2" }])(
                        "given 'createCard' returns newly created card ID $id",
                        ({ id }) => {
                            test("should return created card's ID", async () => {
                                mockedIsDeckAccessible.mockResolvedValue(true);
                                mockedCreateCard.mockResolvedValue(id);

                                const result = await createNewCard(data);

                                expect(result).toEqual(id);
                            });
                        },
                    );
                });
            },
        );
    });
});

describe(updateCard, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await updateCard(fakeCompliantValue(data), fakeCompliantValue());

                expect((result as Response).status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        { data: { deckId: "deck1", front: "_Hello_", back: "H**a**llo" }, id: "card1" },
        { data: { deckId: "deck2", front: "1. lorem", back: "2. ipsum" }, id: "card2" },
    ])("given valid data $data and ID $id", ({ data, id }) => {
        describe.each([{ userId: "user1" }, { userId: "user2" }])(
            "given current user's ID is $userId",
            ({ userId }) => {
                test("should check card accessibility for current user", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                    await updateCard(data, id);

                    expect(mockedIsCardAccessible).toHaveBeenCalledExactlyOnceWith(userId, id);
                });

                describe("given card is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedIsCardAccessible.mockResolvedValue(false);

                        const result = await updateCard(data, id);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given card is accessible to user", () => {
                    test("should check target deck accessibility for current user", async () => {
                        mockedGetUserIdOrRedirect.mockResolvedValue(userId);
                        mockedIsCardAccessible.mockResolvedValue(true);

                        await updateCard(data, id);

                        expect(mockedIsDeckAccessible).toHaveBeenCalledExactlyOnceWith(
                            userId,
                            data.deckId,
                        );
                    });

                    describe("given target deck is not accessible to user", () => {
                        test("should return not found response", async () => {
                            mockedIsCardAccessible.mockResolvedValue(true);
                            mockedIsDeckAccessible.mockResolvedValue(false);

                            const result = await updateCard(data, id);

                            expect((result as Response).status).toEqual(ResponseNotFound.status);
                        });
                    });

                    describe("given target deck is accessible to user", () => {
                        test("should call 'editCard' with card ID and new card data", async () => {
                            mockedIsCardAccessible.mockResolvedValue(true);
                            mockedIsDeckAccessible.mockResolvedValue(true);

                            await updateCard(data, id);

                            expect(mockedEditCard).toHaveBeenCalledExactlyOnceWith(id, data);
                        });
                    });
                });
            },
        );
    });
});

describe(deleteCard, () => {
    describe.each([{ id: "card1" }, { id: "card2" }])("given id $id", ({ id }) => {
        describe.each([{ userId: "user1" }, { userId: "user2" }])(
            "given current user's ID is $userId",
            ({ userId }) => {
                test("should check card accessibility for current user", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                    await deleteCard(id);

                    expect(mockedIsCardAccessible).toHaveBeenCalledExactlyOnceWith(userId, id);
                });

                describe("given card is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedIsCardAccessible.mockResolvedValue(false);

                        const result = await deleteCard(id);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given card is accessible to user", () => {
                    test("should call 'removeCard' with card ID", async () => {
                        mockedIsCardAccessible.mockResolvedValue(true);

                        await deleteCard(id);

                        expect(mockedRemoveCard).toHaveBeenCalledExactlyOnceWith(id);
                    });
                });
            },
        );
    });
});

describe(reviewCardWithRating, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    describe.each([
        { id: "card1", answer: "Lorem ipsum" },
        { id: "card2", answer: "" },
    ])("given id $id and answer $answer", ({ id, answer }) => {
        describe.each([
            { rating: ReviewRating.Again },
            { rating: ReviewRating.Hard },
            { rating: ReviewRating.Good },
            { rating: ReviewRating.Easy },
        ])("given review rating $rating", ({ rating }) => {
            describe.each([
                { user: { id: "user1", timezone: "America/New_York" } as SelectUser },
                { user: { id: "user2", timezone: "Europe/Berlin" } as SelectUser },
            ])("given current user data is $user", ({ user }) => {
                test("should check card accessibility for current user", async () => {
                    mockedGetUserOrRedirect.mockResolvedValue(user);

                    await reviewCardWithRating(id, answer, rating);

                    expect(mockedIsCardAccessible).toHaveBeenCalledExactlyOnceWith(user.id, id);
                });

                describe("given card is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedGetUserOrRedirect.mockResolvedValue(user);
                        mockedIsCardAccessible.mockResolvedValue(false);

                        const result = await reviewCardWithRating(id, answer, rating);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given card is accessible to user", () => {
                    describe.each([
                        { now: new Date("2023-05-16T06:08:13.000Z") },
                        { now: new Date("2025-03-13T19:25:48.000Z") },
                    ])("given current timestamp is $now", ({ now }) => {
                        test("should call 'reviewCard' with card ID, answer, current timestamp, end-of-day timestamp in user's time zone, and rating", async () => {
                            vi.setSystemTime(now);
                            mockedGetUserOrRedirect.mockResolvedValue(user);
                            mockedIsCardAccessible.mockResolvedValue(true);

                            await reviewCardWithRating(id, answer, rating);

                            expect(mockedReviewCard).toHaveBeenCalledExactlyOnceWith(
                                id,
                                answer,
                                now,
                                getDayEnd(now, user.timezone),
                                rating,
                            );
                        });
                    });
                });
            });
        });
    });
});
