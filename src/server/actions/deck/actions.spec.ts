import { ResponseBadRequest, ResponseNotFound } from "@/lib/responses";
import { getUserIdOrRedirect } from "@/lib/utils/server";
import { createNewDeck, deleteDeck, updateDeck } from "@/server/actions/deck/actions";
import { createDeck, editDeck, isDeckAccessible, removeDeck } from "@/server/data/services/deck";
import { fakeCompliantValue } from "@/test/mock/generic";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/utils/server");
vi.mock("@/server/data/services/deck");

const mockedGetUserIdOrRedirect = vi.mocked(getUserIdOrRedirect);
const mockedCreateDeck = vi.mocked(createDeck);
const mockedIsDeckAccessible = vi.mocked(isDeckAccessible);
const mockedEditDeck = vi.mocked(editDeck);
const mockedRemoveDeck = vi.mocked(removeDeck);

describe(createNewDeck, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await createNewDeck(fakeCompliantValue(data));

                expect((result as Response).status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([{ data: { name: "Japanese" } }, { data: { name: "Polish" } }])(
        "given valid data $data",
        ({ data }) => {
            describe.each([{ userId: "user1" }, { userId: "user2" }])(
                "given current user's ID is $userId",
                ({ userId }) => {
                    test("should call 'createDeck' with user ID and deck data", async () => {
                        mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                        await createNewDeck(data);

                        expect(mockedCreateDeck).toHaveBeenCalledExactlyOnceWith({
                            userId,
                            ...data,
                        });
                    });

                    describe.each([{ id: "deck1" }, { id: "deck2" }])(
                        "given 'createDeck' returns newly created deck ID $id",
                        ({ id }) => {
                            test("should return created deck's ID", async () => {
                                mockedCreateDeck.mockResolvedValue(id);

                                const result = await createNewDeck(data);

                                expect(result).toEqual(id);
                            });
                        },
                    );
                },
            );
        },
    );
});

describe(updateDeck, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await updateDeck(fakeCompliantValue(data), fakeCompliantValue());

                expect((result as Response).status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        { data: { name: "Japanese" }, id: "deck1" },
        { data: { name: "Polish" }, id: "deck2" },
    ])("given valid data $data and ID $id", ({ data, id }) => {
        describe.each([{ userId: "user1" }, { userId: "user2" }])(
            "given current user's ID is $userId",
            ({ userId }) => {
                test("should check deck accessibility for current user", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                    await updateDeck(data, id);

                    expect(mockedIsDeckAccessible).toHaveBeenCalledExactlyOnceWith(userId, id);
                });

                describe("given deck is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(false);

                        const result = await updateDeck(data, id);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given deck is accessible to user", () => {
                    test("should call 'editDeck' with deck ID and new deck data", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(true);

                        await updateDeck(data, id);

                        expect(mockedEditDeck).toHaveBeenCalledExactlyOnceWith(id, data);
                    });
                });
            },
        );
    });
});

describe(deleteDeck, () => {
    describe.each([{ id: "deck1" }, { id: "deck2" }])("given ID $id", ({ id }) => {
        describe.each([{ userId: "user1" }, { userId: "user2" }])(
            "given current user's ID is $userId",
            ({ userId }) => {
                test("should check deck accessibility for current user", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(userId);

                    await deleteDeck(id);

                    expect(mockedIsDeckAccessible).toHaveBeenCalledExactlyOnceWith(userId, id);
                });

                describe("given deck is not accessible to user", () => {
                    test("should return not found response", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(false);

                        const result = await deleteDeck(id);

                        expect((result as Response).status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given deck is accessible to user", () => {
                    test("should call 'removeDeck' with deck ID", async () => {
                        mockedIsDeckAccessible.mockResolvedValue(true);

                        await deleteDeck(id);

                        expect(mockedRemoveDeck).toHaveBeenCalledExactlyOnceWith(id);
                    });
                });
            },
        );
    });
});
