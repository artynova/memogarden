import { z } from "zod";

/**
 * Schema for the credentials-based sign-in form, does not enforce password strength because the
 * password is only being matched against a stored one, not created.
 */
export const CredentialsSigninSchema = z.object({
    email: z.string().min(1, { message: "Required" }).email({ message: "Must be a valid email" }),
    password: z.string().min(1, { message: "Required" }),
});

/**
 * Data for credentials-based sign-in, based on the corresponding schema.
 */
export type CredentialsSigninData = z.infer<typeof CredentialsSigninSchema>;

const passwordField = z
    .string()
    .min(1, { message: "Required" })
    .min(8, { message: "Must be at least 8 characters" })
    .max(32, { message: "Must be at most 32 characters" })
    .regex(/^(?=.*[a-z]).+$/, {
        message: "Must contain at least one lowercase latin letter",
    })
    .regex(/^(?=.*[A-Z]).+$/, {
        message: "Must contain at least one uppercase latin letter",
    })
    .regex(/^(?=.*\d).+$/, {
        message: "Must contain at least one digit",
    })
    .regex(/^(?=.*[\W_]).+$/, {
        message: 'Must contain at least one special character, like "#"',
    });

/**
 * Schema for the credentials-based sign-up form, enforces password strength.
 */
export const CredentialsSignupSchema = z.intersection(
    z.object({
        email: z
            .string()
            .min(1, { message: "Required" })
            .email({ message: "Must be a valid email" }),
        password: passwordField,
        confirmPassword: z.string().min(1, { message: "Required" }),
    }),
    // This separate schema with optional fields is required to have the matching refinement run regardless of whether any of the fields' presence, thus allowing to report mismatches at all times instead of only when the base schema validation passes
    z
        .object({
            password: z.string(),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Confirmation must match the password",
            path: ["confirmPassword"],
        }),
);

/**
 * Data for credentials-based sign-up, based on the corresponding schema.
 */
export type CredentialsSignupData = z.infer<typeof CredentialsSignupSchema>;

/**
 * Schema for the password change form, requires the old password, the new password (tested for
 * strength), and a confirmation of the new password.
 */
export const ChangePasswordSchema = z.intersection(
    z.intersection(
        z.object({
            oldPassword: z.string().min(1, { message: "Required" }),
            password: passwordField,
            confirmPassword: z.string().min(1, { message: "Required" }),
        }),
        z
            .object({
                oldPassword: z.string(),
                password: z.string(),
            })
            .refine((data) => data.oldPassword != data.password, {
                message: "New password must be different from the old password",
                path: ["password"],
            }),
    ),
    z
        .object({
            password: z.string(),
            confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Confirmation must match the new password",
            path: ["confirmPassword"],
        }),
);

/**
 * Data for password change, based on the corresponding schema.
 */
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

/**
 * Schema for updating user settings.
 */
export const UpdateUserSchema = z.object({
    timezone: z
        .string()
        .min(1, { message: "Required" })
        .refine((timezone) => Intl.supportedValuesOf("timeZone").includes(timezone), {
            message: "Must be a valid time zone",
        }),
    avatarId: z.number(),
    darkMode: z.boolean().nullable(),
});

/**
 * Data for updating user settings, based on the corresponding schema.
 */
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
