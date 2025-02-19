import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
    getUserOrRedirect,
    getUserOrRedirectSC,
    parseIntParam,
    parseStringParam,
} from "@/lib/utils/server";
import { Session } from "next-auth";
import { getUser, maybeSyncUserHealth } from "@/server/data/services/user";
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
    test.each([
        { param: undefined, expected: null },
        { param: "test", expected: "test" },
        { param: ["test1", "test2"], expected: "test1" },
    ])("should return $expected for input $param", ({ param, expected }) => {
        const output = parseStringParam(param);

        expect(output).toEqual(expected);
    });
});

describe(parseIntParam, () => {
    test.each([
        { param: undefined, expected: null },
        { param: "1", expected: 1 },
        { param: "1.5", expected: 1 },
        { param: "not a number", expected: null },
        { param: ["1", "2"], expected: 1 },
        { param: ["1.5", "2"], expected: 1 },
        { param: ["not a number", "2"], expected: null },
    ])("should return $expected for input $param", ({ param, expected }) => {
        const output = parseIntParam(param);

        expect(output).toEqual(expected);
    });
});

describe(getUserOrRedirectSC, () => {
    test.each([
        { condition: "session is absent", authResolvedTo: null, getUserResolvedTo: null },
        {
            condition: "user ID is absent from session data",
            authResolvedTo: { user: {}, expires: "" },
            getUserResolvedTo: null,
        },
        {
            condition: "session user ID does not have a match in the database",
            authResolvedTo: { user: { id: "id" }, expires: "" },
            getUserResolvedTo: null,
        },
        {
            condition: 'the token has been invalidated through the "accept tokens after" date',
            authResolvedTo: { user: { id: "id", tokenIat: 0 }, expires: "" },
            getUserResolvedTo: {
                id: "id",
                lastHealthSync: new Date(0),
                timezone: "",
                retrievability: null,
                avatarId: 0,
                darkMode: null,
                acceptTokensAfter: new Date(1),
            },
        },
    ])("should force sign-out if $condition", async ({ authResolvedTo, getUserResolvedTo }) => {
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

    test("should re-fetch user data from the database if a health sync occurs", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(true); // Pretend that the sync did occur, necessitating a data refetch

        await getUserOrRedirectSC();

        expect(mockedGetUser).toHaveBeenCalledTimes(2);
    });

    test("should not re-fetch user data from the database if a health sync does not occur", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

        await getUserOrRedirectSC();

        expect(mockedGetUser).toHaveBeenCalledOnce();
    });

    test("should retrieve a user with the same ID as in the session token", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

        const user = await getUserOrRedirectSC();

        expect(mockedGetUser).toHaveBeenCalledExactlyOnceWith("id");
        expect(mockedMaybeSyncUserHealth).toHaveBeenCalledExactlyOnceWith("id");
        expect(user.id).toEqual("id");
    });
});

describe(getUserOrRedirect, () => {
    test.each([
        { condition: "session is absent", authResolvedTo: null, getUserResolvedTo: null },
        {
            condition: "user ID is absent from session data",
            authResolvedTo: { user: {}, expires: "" },
            getUserResolvedTo: null,
        },
        {
            condition: "session user ID does not have a match in the database",
            authResolvedTo: { user: { id: "id" }, expires: "" },
            getUserResolvedTo: null,
        },
        {
            condition: 'the token has been invalidated through the "accept tokens after" date',
            authResolvedTo: { user: { id: "id", tokenIat: 0 }, expires: "" },
            getUserResolvedTo: {
                id: "id",
                lastHealthSync: new Date(0),
                timezone: "",
                retrievability: null,
                avatarId: 0,
                darkMode: null,
                acceptTokensAfter: new Date(1),
            },
        },
    ])("should force sign-out if $condition", async ({ authResolvedTo, getUserResolvedTo }) => {
        mockedAuth.mockResolvedValue(authResolvedTo);
        mockedGetUser.mockResolvedValue(getUserResolvedTo);
        mockedSignout.mockImplementation(() => {
            throw Error(); // Error like in the real redirect function, to conform to the "never" return type
        });

        try {
            await getUserOrRedirect();
        } catch {} // Silence the error

        expect(mockedSignout).toHaveBeenCalledOnce();
    });

    test("should re-fetch user data from the database if a health sync occurs", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(true); // Pretend that the sync did occur, necessitating a data refetch

        await getUserOrRedirect();

        expect(mockedGetUser).toHaveBeenCalledTimes(2);
    });

    test("should not re-fetch user data from the database if a health sync does not occur", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

        await getUserOrRedirect();

        expect(mockedGetUser).toHaveBeenCalledOnce();
    });

    test("should retrieve a user with the same ID as in the session token", async () => {
        mockedAuth.mockResolvedValue({ user: { id: "id", tokenIat: 1 }, expires: "" });
        mockedGetUser.mockResolvedValue({
            id: "id",
            lastHealthSync: new Date(0),
            timezone: "",
            retrievability: null,
            avatarId: 0,
            darkMode: null,
            acceptTokensAfter: new Date(1),
        });
        mockedMaybeSyncUserHealth.mockResolvedValue(false); // Pretend that the sync did not occur

        const user = await getUserOrRedirect();

        expect(mockedGetUser).toHaveBeenCalledExactlyOnceWith("id");
        expect(mockedMaybeSyncUserHealth).toHaveBeenCalledExactlyOnceWith("id");
        expect(user.id).toEqual("id");
    });
});
