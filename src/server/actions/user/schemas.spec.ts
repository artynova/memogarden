import {
    ChangePasswordSchema,
    CredentialsSigninSchema,
    CredentialsSignupSchema,
    UpdateUserSchema,
} from "@/server/actions/user/schemas";
import { describe, expect, test } from "vitest";

describe("CredentialsSigninSchema", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([
            { error: "Required" },
            { email: "", error: "Required" },
            {
                email: "admin@gmail.c", // Not a proper email domain
                error: "Must be a valid email",
            },
        ])("given input data with invalid email $email", ({ email, error }) => {
            test(`should report first email error '${error}'`, () => {
                const output = CredentialsSigninSchema.safeParse({ email });

                expect(output).toHaveFirstParsingError("email", error);
            });
        });

        describe.each([{ error: "Required" }, { password: "", error: "Required" }])(
            "given input data with invalid password $password",
            ({ password, error }) => {
                test(`should report first password error '${error}'`, () => {
                    const output = CredentialsSigninSchema.safeParse({ password });

                    expect(output).toHaveFirstParsingError("password", error);
                });
            },
        );

        describe.each([
            { data: { email: "smith@example.com", password: "matrix" } },
            { data: { email: "smith@example.com", password: "m4tR_ixx" } },
        ])("given valid input data $data", ({ data }) => {
            test("should output successfully parsed data", () => {
                const output = CredentialsSigninSchema.safeParse(data);

                expect(output.data).toEqual(data);
            });
        });
    });
});

describe("CredentialsSignupSchema", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([
            { error: "Required" },
            { email: "", error: "Required" },
            {
                email: "admin@gmail.c", // Not a proper email domain
                error: "Must be a valid email",
            },
        ])("given input data with invalid email $email", ({ email, error }) => {
            test(`should report first email error '${error}'`, () => {
                const output = CredentialsSignupSchema.safeParse({ email });

                expect(output).toHaveFirstParsingError("email", error);
            });
        });

        describe.each([
            { error: "Required" },
            { password: "", error: "Required" },
            { password: "a", error: "Must be at least 8 characters" },
            { password: "A".repeat(33), error: "Must be at most 32 characters" },
            {
                password: "A".repeat(32),
                error: "Must contain at least one lowercase latin letter",
            },
            { password: "aaaaaaaa", error: "Must contain at least one uppercase latin letter" },
            { password: "aAaaaaaa", error: "Must contain at least one digit" },
            {
                password: "aA4aaaaa",
                error: 'Must contain at least one special character, like "#"',
            },
        ])("given input data with invalid password $password", ({ password, error }) => {
            test(`should report first password error '${error}'`, () => {
                const output = CredentialsSignupSchema.safeParse({ password });

                expect(output).toHaveFirstParsingError("password", error);
            });
        });

        describe.each([{ error: "Required" }, { confirmPassword: "", error: "Required" }])(
            "given input data with invalid password confirmation $confirmPassword",
            ({ confirmPassword, error }) => {
                test(`should report first password confirmation error '${error}'`, () => {
                    const output = CredentialsSignupSchema.safeParse({ confirmPassword });

                    expect(output).toHaveFirstParsingError("confirmPassword", error);
                });
            },
        );

        describe.each([
            {
                password: "AAaa11!!",
                confirmPassword: "aaAA",
                error: "Confirmation must match the password",
            },
        ])(
            "given input data with invalid pair of password $password and password confirmation $confirmPassword",
            ({ password, confirmPassword, error }) => {
                test(`should report first password confirmation error '${error}'`, () => {
                    const output = CredentialsSignupSchema.safeParse({ password, confirmPassword });

                    expect(output).toHaveFirstParsingError("confirmPassword", error);
                });
            },
        );

        describe.each([
            {
                data: {
                    email: "morpheus@example.com",
                    password: "r3d_p1L!",
                    confirmPassword: "r3d_p1L!",
                },
            },
            {
                data: {
                    email: "smith@example.com",
                    password: "m4tR_ixx",
                    confirmPassword: "m4tR_ixx",
                },
            },
        ])("given valid input data $data", ({ data }) => {
            test("should output successfully parsed data", () => {
                const output = CredentialsSignupSchema.safeParse(data);

                expect(output.data).toEqual(data);
            });
        });
    });
});

describe("ChangePasswordSchema", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([{ error: "Required" }, { oldPassword: "", error: "Required" }])(
            "given input data with invalid old password $oldPassword",
            ({ oldPassword, error }) => {
                test(`should report first email error '${error}'`, () => {
                    const output = ChangePasswordSchema.safeParse({ oldPassword });

                    expect(output).toHaveFirstParsingError("oldPassword", error);
                });
            },
        );

        describe.each([
            { error: "Required" },
            { password: "", error: "Required" },
            { password: "a", error: "Must be at least 8 characters" },
            { password: "A".repeat(33), error: "Must be at most 32 characters" },
            {
                password: "A".repeat(32),
                error: "Must contain at least one lowercase latin letter",
            },
            { password: "aaaaaaaa", error: "Must contain at least one uppercase latin letter" },
            { password: "aAaaaaaa", error: "Must contain at least one digit" },
            {
                password: "aA4aaaaa",
                error: 'Must contain at least one special character, like "#"',
            },
        ])("given input data with invalid password $password", ({ password, error }) => {
            test(`should report first password error '${error}'`, () => {
                const output = ChangePasswordSchema.safeParse({ password });

                expect(output).toHaveFirstParsingError("password", error);
            });
        });

        describe.each([
            {
                oldPassword: "AAaa11!!",
                password: "AAaa11!!",
                error: "New password must be different from the old password",
            },
        ])(
            "given input data with invalid pair of old password $oldPassword and password $password",
            ({ oldPassword, password, error }) => {
                test(`should report first password confirmation error '${error}'`, () => {
                    const output = ChangePasswordSchema.safeParse({ oldPassword, password });

                    expect(output).toHaveFirstParsingError("password", error);
                });
            },
        );

        describe.each([{ error: "Required" }, { confirmPassword: "", error: "Required" }])(
            "given input data with invalid password confirmation $confirmPassword",
            ({ confirmPassword, error }) => {
                test(`should report first password confirmation error '${error}'`, () => {
                    const output = ChangePasswordSchema.safeParse({ confirmPassword });

                    expect(output).toHaveFirstParsingError("confirmPassword", error);
                });
            },
        );

        describe.each([
            {
                password: "AAaa11!!",
                confirmPassword: "aaAA",
                error: "Confirmation must match the new password",
            },
        ])(
            "given input data with invalid pair of password $password and password confirmation $confirmPassword",
            ({ password, confirmPassword, error }) => {
                test(`should report first password confirmation error '${error}'`, () => {
                    const output = ChangePasswordSchema.safeParse({ password, confirmPassword });

                    expect(output).toHaveFirstParsingError("confirmPassword", error);
                });
            },
        );

        describe.each([
            {
                data: {
                    oldPassword: "p1L!_r3d",
                    password: "r3d_p1L!",
                    confirmPassword: "r3d_p1L!",
                },
            },
            {
                data: {
                    oldPassword: "ixx_m4tR",
                    password: "m4tR_ixx",
                    confirmPassword: "m4tR_ixx",
                },
            },
        ])("given valid input data $data", ({ data }) => {
            test("should output successfully parsed data", () => {
                const output = ChangePasswordSchema.safeParse(data);

                expect(output.data).toEqual(data);
            });
        });
    });
});

describe("UpdateUserSchema.safeParse", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([
            { error: "Required" },
            { timezone: "", error: "Required" },
            { timezone: "a", error: "Must be a valid time zone" },
        ])("given input data with invalid time zone $timezone", ({ timezone, error }) => {
            test(`should report first email error '${error}'`, () => {
                const output = UpdateUserSchema.safeParse({ timezone });

                expect(output).toHaveFirstParsingError("timezone", error);
            });
        });

        describe.each([
            { error: "Required" },
            { avatarId: "", error: "Expected number, received string" },
        ])("given input data with invalid avatar ID $timezone", ({ avatarId, error }) => {
            test(`should report first email error '${error}'`, () => {
                const output = UpdateUserSchema.safeParse({ avatarId });

                expect(output).toHaveFirstParsingError("avatarId", error);
            });
        });

        describe.each([
            { error: "Required" },
            { darkMode: 1, error: "Expected boolean, received number" },
        ])("given input data with invalid avatar ID $timezone", ({ darkMode, error }) => {
            test(`should report first email error '${error}'`, () => {
                const output = UpdateUserSchema.safeParse({ darkMode });

                expect(output).toHaveFirstParsingError("darkMode", error);
            });
        });

        describe.each([
            {
                data: {
                    timezone: "America/New_York",
                    avatarId: 1,
                    darkMode: true,
                },
            },
            {
                data: {
                    timezone: "Europe/Berlin",
                    avatarId: 3,
                    darkMode: false,
                },
            },
            {
                data: {
                    timezone: "Europe/Warsaw",
                    avatarId: 0,
                    darkMode: null,
                },
            },
        ])("given valid input data $data", ({ data }) => {
            test("should output successfully parsed data", () => {
                const output = UpdateUserSchema.safeParse(data);

                expect(output.data).toEqual(data);
            });
        });
    });
});
