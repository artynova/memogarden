import { z } from "zod";

/**
 * Schema for the credentials-based signin form, does not enforce password strength because the password is only
 * being matched against a stored one, not created.
 */
export const CredentialsSigninSchema = z.object({
    email: z.string().min(1, { message: "Required" }).email({ message: "Must be a valid email" }),
    password: z.string().min(1, { message: "Required" }),
});

export type CredentialsSigninData = z.infer<typeof CredentialsSigninSchema>;

/**
 * Schema for the credentials-based sign-up form, enforces password strength.
 */
export const CredentialsSignupSchema = z
    .object({
        email: z.string().min(1, { message: "Required" }).email(),
        password: z
            .string()
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
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

export type CredentialsSignupData = z.infer<typeof CredentialsSignupSchema>;

/**
 * Schema for the user input required to create a new deck.
 */
export const CreateDeckSchema = z.object({
    name: z.string().min(1, { message: "Required" }),
});

export type CreateDeckData = z.infer<typeof CreateDeckSchema>;

/**
 * Schema for the user input required to update an existing deck (the deck ID is not part of the input and is passed
 * separately).
 */
export const UpdateDeckSchema = CreateDeckSchema.extend({});

export type UpdateDeckData = z.infer<typeof UpdateDeckSchema>;
