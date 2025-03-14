import {
    ResponseBadRequest,
    ResponseConflict,
    ResponseNotFound,
    ResponseUnauthorized,
} from "@/lib/responses";
import { REDIRECT_WITH_TOKEN_TO, REDIRECT_WITHOUT_TOKEN_TO } from "@/lib/routes";
import { getUserIdOrRedirect } from "@/lib/utils/server";
import {
    changePassword,
    signinWithCredentials,
    signinWithFacebook,
    signinWithGoogle,
    signout,
    signoutEverywhere,
    signup,
    updateUser,
} from "@/server/actions/user/actions";
import { signIn, signOut } from "@/server/auth";
import {
    createCredentialsUser,
    editUser,
    getUserCredentialsByEmail,
    getUserPasswordHash,
    invalidateAllTokens,
    SelectUser,
    updateUserPassword,
} from "@/server/data/services/user";
import { fakeCompliantValue } from "@/test/mock/generic";
import { CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/server/data/services/user");
vi.mock("next/navigation");
vi.mock("@/server/auth");
vi.mock("@/lib/utils/server");
vi.mock("bcrypt");

const mockedGetUserCredentialsByEmail = vi.mocked(getUserCredentialsByEmail);
const mockedCreateCredentialsUser = vi.mocked(createCredentialsUser);
const mockedRedirect = vi.mocked(redirect);
const mockedSignIn = vi.mocked(signIn);
const mockedSignOut = vi.mocked(signOut);
const mockedGetUserIdOrRedirect = vi.mocked(getUserIdOrRedirect);
const mockedGetUserPasswordHash = vi.mocked(getUserPasswordHash);
const mockedCompareSync = vi.mocked(bcrypt.compareSync);
const mockedUpdateUserPassword = vi.mocked(updateUserPassword);
const mockedInvalidateAllTokens = vi.mocked(invalidateAllTokens);
const mockedEditUser = vi.mocked(editUser);

describe(signup, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await signup(fakeCompliantValue(data), fakeCompliantValue());

                expect(result.status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        {
            data: {
                email: "neo@example.com",
                password: "mAtrix123#",
                confirmPassword: "mAtrix123#",
            },
        },
        {
            data: {
                email: "smith@example.com",
                password: "#321xirtAm",
                confirmPassword: "#321xirtAm",
            },
        },
    ])("given valid data $data", ({ data }) => {
        describe.each([{ timezone: "" }, { timezone: "fake timezone" }])(
            "given invalid time zone $timezone",
            ({ timezone }) => {
                test("should return bad request response", async () => {
                    const result = await signup(data, timezone);

                    expect(result.status).toEqual(ResponseBadRequest.status);
                });
            },
        );

        describe.each([{ timezone: "America/New_York" }, { timezone: "Europe/Berlin" }])(
            "given valid time zone $timezone",
            ({ timezone }) => {
                test("should check if email is already in use", async () => {
                    await signup(data, timezone);

                    expect(mockedGetUserCredentialsByEmail).toHaveBeenCalledExactlyOnceWith(
                        data.email,
                    );
                });

                describe("given email is already in use", () => {
                    test("should return conflict response", async () => {
                        mockedGetUserCredentialsByEmail.mockResolvedValue({
                            userId: "user1",
                            email: data.email,
                            passwordHash: "",
                        });

                        const result = await signup(data, timezone);

                        expect(result.status).toEqual(ResponseConflict.status);
                    });
                });

                describe("given email is not already in use", () => {
                    test("should call 'createCredentialsUser' with given credentials and time zone", async () => {
                        mockedGetUserCredentialsByEmail.mockResolvedValue(null);

                        await signup(data, timezone);

                        expect(mockedCreateCredentialsUser).toHaveBeenCalledExactlyOnceWith(
                            data.email,
                            data.password,
                            timezone,
                        );
                    });

                    test(`should redirect to ${REDIRECT_WITHOUT_TOKEN_TO}`, async () => {
                        mockedGetUserCredentialsByEmail.mockResolvedValue(null);

                        await signup(data, timezone);

                        expect(mockedRedirect).toHaveBeenCalledExactlyOnceWith(
                            REDIRECT_WITHOUT_TOKEN_TO,
                        );
                    });
                });
            },
        );
    });
});

describe(signinWithCredentials, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await signinWithCredentials(fakeCompliantValue(data));

                expect(result.status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        {
            data: {
                email: "neo@example.com",
                password: "mAtrix123#",
            },
        },
        {
            data: {
                email: "smith@example.com",
                password: "#321xirtAm",
            },
        },
    ])("given valid data $data", ({ data }) => {
        test("should attempt sign-in with given credentials", async () => {
            await signinWithCredentials(data);

            expect(mockedSignIn).toHaveBeenCalledExactlyOnceWith("credentials", data);
        });

        describe("given sign-in with credentials is unsuccessful", () => {
            test("should return unauthorized response", async () => {
                mockedSignIn.mockImplementation(() => {
                    throw new CredentialsSignin();
                });

                const result = await signinWithCredentials(data);

                expect(result.status).toEqual(ResponseUnauthorized.status);
            });
        });

        describe("given sign-in with credentials is successful", () => {
            test(`should redirect to '${REDIRECT_WITH_TOKEN_TO}'`, async () => {
                await signinWithCredentials(data);

                expect(mockedRedirect).toHaveBeenCalledExactlyOnceWith(REDIRECT_WITH_TOKEN_TO);
            });
        });
    });
});

describe(signinWithGoogle, () => {
    test(`should initiate Google sign-in with redirect to ${REDIRECT_WITH_TOKEN_TO}`, async () => {
        await signinWithGoogle();

        expect(mockedSignIn).toHaveBeenCalledExactlyOnceWith("google", {
            redirectTo: REDIRECT_WITH_TOKEN_TO,
        });
    });
});

describe(signinWithFacebook, () => {
    test(`should initiate Facebook sign-in with redirect to ${REDIRECT_WITH_TOKEN_TO}`, async () => {
        await signinWithFacebook();

        expect(mockedSignIn).toHaveBeenCalledExactlyOnceWith("facebook", {
            redirectTo: REDIRECT_WITH_TOKEN_TO,
        });
    });
});

describe(signout, () => {
    test(`should initiate sign-out with redirect to ${REDIRECT_WITHOUT_TOKEN_TO}`, async () => {
        await signout();

        expect(mockedSignOut).toHaveBeenCalledExactlyOnceWith({
            redirectTo: REDIRECT_WITHOUT_TOKEN_TO,
        });
    });
});

describe(changePassword, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await changePassword(fakeCompliantValue(data));

                expect(result.status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        {
            data: {
                oldPassword: "AAaa11!!",
                password: "mAtrix123#",
                confirmPassword: "mAtrix123#",
            },
        },
        {
            data: {
                oldPassword: "!!11aaAA",
                password: "#321xirtAm",
                confirmPassword: "#321xirtAm",
            },
        },
    ])("given valid data $data", ({ data }) => {
        describe.each([{ id: "user1" }, { id: "user2" }])(
            "given current user's ID is $id",
            ({ id }) => {
                test("should get current user's password hash", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(id);

                    await changePassword(data);

                    expect(mockedGetUserPasswordHash).toHaveBeenCalledExactlyOnceWith(id);
                });

                describe("given user has no credentials data in database", () => {
                    test("should return not found response", async () => {
                        mockedGetUserIdOrRedirect.mockResolvedValue(id);
                        mockedGetUserPasswordHash.mockResolvedValue(null);

                        const result = await changePassword(data);

                        expect(result.status).toEqual(ResponseNotFound.status);
                    });
                });

                describe("given user has credentials data in database", () => {
                    describe("given input current password does not match against stored hash", () => {
                        test("should return unauthorized response", async () => {
                            mockedGetUserIdOrRedirect.mockResolvedValue(id);
                            mockedGetUserPasswordHash.mockResolvedValue("hash");
                            mockedCompareSync.mockReturnValue(false);

                            const result = await changePassword(data);

                            expect(result.status).toEqual(ResponseUnauthorized.status);
                        });
                    });

                    describe("given input current password matches against stored hash", () => {
                        test("should update user password to new password", async () => {
                            mockedGetUserIdOrRedirect.mockResolvedValue(id);
                            mockedGetUserPasswordHash.mockResolvedValue("hash");
                            mockedCompareSync.mockReturnValue(true);

                            await changePassword(data);

                            expect(mockedUpdateUserPassword).toHaveBeenCalledExactlyOnceWith(
                                id,
                                data.password,
                            );
                        });

                        test("should invalidate all user's tokens", async () => {
                            mockedGetUserIdOrRedirect.mockResolvedValue(id);
                            mockedGetUserPasswordHash.mockResolvedValue("hash");
                            mockedCompareSync.mockReturnValue(true);

                            await changePassword(data);

                            expect(mockedInvalidateAllTokens).toHaveBeenCalledExactlyOnceWith(id);
                        });

                        test("should initiate standard sign-out for current session", async () => {
                            mockedGetUserIdOrRedirect.mockResolvedValue(id);
                            mockedGetUserPasswordHash.mockResolvedValue("hash");
                            mockedCompareSync.mockReturnValue(true);

                            await changePassword(data);

                            expect(mockedSignOut).toHaveBeenCalledExactlyOnceWith({
                                redirectTo: REDIRECT_WITHOUT_TOKEN_TO,
                            });
                        });
                    });
                });
            },
        );
    });
});

describe(signoutEverywhere, () => {
    describe.each([
        { user: { id: "user2" } as SelectUser },
        { user: { id: "test_id" } as SelectUser },
    ])("given current user data $user", ({ user }) => {
        test("should invalidate all user's tokens", async () => {
            mockedGetUserIdOrRedirect.mockResolvedValue(user.id);

            await signoutEverywhere();

            expect(mockedInvalidateAllTokens).toHaveBeenCalledExactlyOnceWith(user.id);
        });

        test("should initiate standard sign-out for current session", async () => {
            mockedGetUserIdOrRedirect.mockResolvedValue(user.id);

            await signoutEverywhere();

            expect(mockedSignOut).toHaveBeenCalledExactlyOnceWith({
                redirectTo: REDIRECT_WITHOUT_TOKEN_TO,
            });
        });
    });
});

describe(updateUser, () => {
    describe.each([{ data: { unknownField: 42 } }, { data: "tampered_data" }])(
        "given invalid data $data",
        ({ data }) => {
            test("should return bad request response", async () => {
                const result = await updateUser(fakeCompliantValue(data));

                expect(result?.status).toEqual(ResponseBadRequest.status);
            });
        },
    );

    describe.each([
        { data: { timezone: "America/New_York", avatarId: 1, darkMode: true } },
        { data: { timezone: "Europe/Berlin", avatarId: 3, darkMode: null } },
    ])("given valid data $data", ({ data }) => {
        describe.each([{ id: "user1" }, { id: "user2" }])(
            "given current user's ID is $id",
            ({ id }) => {
                test("should call 'editUser' with given data", async () => {
                    mockedGetUserIdOrRedirect.mockResolvedValue(id);

                    await updateUser(data);

                    expect(mockedEditUser).toHaveBeenCalledExactlyOnceWith(id, data);
                });
            },
        );
    });
});
