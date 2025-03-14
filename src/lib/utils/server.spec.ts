import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
    getUserIdOrRedirect,
    getUserOrRedirect,
    getUserOrRedirectSC,
    parseIntParam,
    parseStringParam,
} from "@/lib/utils/server";
import { Session } from "next-auth";
import { getUser, maybeSyncUserHealth, SelectUser } from "@/server/data/services/user";
import { signout } from "@/server/actions/user/actions";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/auth");
vi.mock("next/navigation");
vi.mock("@/server/data/services/user");
vi.mock("@/server/actions/user/actions");

const mockedAuth = vi.mocked<() => Promise<Session | null>>(auth); // Out of all the possible overloads, restrict to the one that is used in the server context
const mockedRedirect = vi.mocked(redirect);
const mockedGetUser = vi.mocked(getUser);
const mockedMaybeSyncUserHealth = vi.mocked(maybeSyncUserHealth);
const mockedSignout = vi.mocked(signout);

describe(parseStringParam, () => {
    describe.each([
        { param: undefined, expected: null },
        { param: "test", expected: "test" },
        { param: ["test1", "test2"], expected: "test1" },
    ])("given input $param", ({ param, expected }) => {
        test(`should return ${expected}`, () => {
            const output = parseStringParam(param);

            expect(output).toEqual(expected);
        });
    });
});

describe(parseIntParam, () => {
    describe.each([
        { param: undefined, expected: null },
        { param: "1", expected: 1 },
        { param: "1.5", expected: 1 },
        { param: "not a number", expected: null },
        { param: ["1", "2"], expected: 1 },
        { param: ["1.5", "2"], expected: 1 },
        { param: ["not a number", "2"], expected: null },
    ])("given input $param", ({ param, expected }) => {
        test(`should return ${expected}`, () => {
            const output = parseIntParam(param);

            expect(output).toEqual(expected);
        });
    });
});

describe(getUserOrRedirectSC, () => {
    describe.each([
        { condition: "session data is absent", authResolvedTo: null, getUserResolvedTo: null },
        {
            condition: "user ID is absent from session data",
            authResolvedTo: { user: {} } as Session,
            getUserResolvedTo: null,
        },
        {
            condition: "session user ID does not have corresponding entry in database",
            authResolvedTo: { user: { id: "id" } } as Session,
            getUserResolvedTo: null,
        },
        {
            condition: "token is invalid according to user 'accept tokens after' date",
            authResolvedTo: { user: { id: "id", tokenIat: 0 } } as Session,
            getUserResolvedTo: {
                id: "id",
                acceptTokensAfter: new Date(1),
            } as SelectUser,
        },
    ])("", ({ condition, authResolvedTo, getUserResolvedTo }) => {
        describe(`given ${condition}`, () => {
            test("should force sign-out", async () => {
                mockedAuth.mockResolvedValue(authResolvedTo);
                mockedGetUser.mockResolvedValue(getUserResolvedTo);
                mockedRedirect.mockImplementation(() => {
                    throw Error(); // Error like in the real redirect function, to conform to the "never" return type
                });

                try {
                    await getUserOrRedirectSC();
                } catch {} // Silence the error

                expect(mockedRedirect).toHaveBeenCalledExactlyOnceWith("/signin?invalidToken");
            });
        });
    });

    describe("given session is valid", () => {
        describe("given health sync occurred during fetch", () => {
            test("should re-fetch user data", async () => {
                mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
                mockedGetUser.mockResolvedValue({
                    id: "id",
                    acceptTokensAfter: new Date(1),
                } as SelectUser);
                mockedMaybeSyncUserHealth.mockResolvedValue(true); // Pretend that the sync did occur, necessitating a data refetch

                await getUserOrRedirectSC();

                expect(mockedGetUser).toHaveBeenCalledTimes(2);
            });
        });

        describe("given health sync did not occur during fetch", () => {
            test("should not re-fetch user data", async () => {
                mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 } } as Session);
                mockedGetUser.mockResolvedValue({
                    id: "id",
                    acceptTokensAfter: new Date(1),
                } as SelectUser);
                mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

                await getUserOrRedirectSC();

                expect(mockedGetUser).toHaveBeenCalledOnce();
            });
        });

        describe.each([{ id: "id" }, { id: "a" }, { id: "uuid1" }])(
            "given session user ID is $id",
            ({ id }) => {
                test("should retrieve user with ID matching session user ID", async () => {
                    mockedAuth.mockResolvedValue({ user: { id, tokenIat: 1 } } as Session);
                    mockedGetUser.mockResolvedValue({
                        id,
                        acceptTokensAfter: new Date(1),
                    } as SelectUser);

                    const user = await getUserOrRedirectSC();

                    expect(mockedGetUser).toHaveBeenCalledExactlyOnceWith(id);
                    expect(mockedMaybeSyncUserHealth).toHaveBeenCalledExactlyOnceWith(id);
                    expect(user.id).toEqual(id);
                });
            },
        );
    });
});

function testGetUserOrRedirect<T>(
    testedFn: () => Promise<T>,
    testIdUsage: (sessionUserId: string, output: T) => void,
) {
    describe.each([
        { condition: "session data is absent", authResolvedTo: null, getUserResolvedTo: null },
        {
            condition: "user ID is absent from session data",
            authResolvedTo: { user: {} } as Session,
            getUserResolvedTo: null,
        },
        {
            condition: "session user ID does not have corresponding entry in database",
            authResolvedTo: { user: { id: "id" } } as Session,
            getUserResolvedTo: null,
        },
        {
            condition: "token is invalid according to user 'accept tokens after' date",
            authResolvedTo: { user: { id: "id", tokenIat: 0 } } as Session,
            getUserResolvedTo: {
                id: "id",
                acceptTokensAfter: new Date(1),
            } as SelectUser,
        },
    ])("", ({ condition, authResolvedTo, getUserResolvedTo }) => {
        describe(`given ${condition}`, () => {
            test("should force sign-out", async () => {
                mockedAuth.mockResolvedValue(authResolvedTo);
                mockedGetUser.mockResolvedValue(getUserResolvedTo);
                mockedSignout.mockImplementation(() => {
                    throw Error(); // Error like in the real redirect function, to conform to the "never" return type
                });

                try {
                    await testedFn();
                } catch {} // Silence the error

                expect(mockedSignout).toHaveBeenCalledOnce();
            });
        });
    });

    describe("given session is valid", () => {
        describe("given health sync occurred during fetch", () => {
            test("should re-fetch user data", async () => {
                mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
                mockedGetUser.mockResolvedValue({
                    id: "id",
                    acceptTokensAfter: new Date(1),
                } as SelectUser);
                mockedMaybeSyncUserHealth.mockResolvedValue(true); // Pretend that the sync did occur, necessitating a data refetch

                await testedFn();

                expect(mockedGetUser).toHaveBeenCalledTimes(2);
            });
        });

        describe("given health sync did not occur during fetch", () => {
            test("should not re-fetch user data", async () => {
                mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 } } as Session);
                mockedGetUser.mockResolvedValue({
                    id: "id",
                    acceptTokensAfter: new Date(1),
                } as SelectUser);
                mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

                await testedFn();

                expect(mockedGetUser).toHaveBeenCalledOnce();
            });
        });

        describe.each([{ id: "id" }, { id: "a" }, { id: "uuid1" }])(
            "given session user ID is $id",
            ({ id }) => {
                test("should retrieve user with ID matching session user ID", async () => {
                    mockedAuth.mockResolvedValue({ user: { id, tokenIat: 1 } } as Session);
                    mockedGetUser.mockResolvedValue({
                        id,
                        acceptTokensAfter: new Date(1),
                    } as SelectUser);

                    const output = await testedFn();

                    expect(mockedGetUser).toHaveBeenCalledExactlyOnceWith(id);
                    expect(mockedMaybeSyncUserHealth).toHaveBeenCalledExactlyOnceWith(id);
                    testIdUsage(id, output);
                });
            },
        );
    });
}

describe(getUserOrRedirect, () => {
    testGetUserOrRedirect(getUserOrRedirect, (id, output) => {
        expect(output.id).toEqual(id);
    });
});

describe(getUserIdOrRedirect, () => {
    testGetUserOrRedirect(getUserIdOrRedirect, (id, output) => {
        expect(output).toEqual(id); // Output itself is just the ID
    });
});
