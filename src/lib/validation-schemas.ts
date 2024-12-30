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
 * Schema for the user input required to modify a new deck.
 */
export const ModifyDeckSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Most likely should not be empty" })
        .max(100, { message: "Should be at most 100 characters" }),
});

export type ModifyDeckData = z.infer<typeof ModifyDeckSchema>;

/**
 * Schema for the user input required to modify a card.
 */
export const ModifyCardSchema = z.object({
    deckId: z.string().min(1, { message: "Required" }), // To trigger an error in the select field if no option is selected
    front: z
        .string()
        .min(1, { message: "Most likely should not be empty" })
        .max(300, { message: "Should be at most 300 characters" }),
    back: z
        .string()
        .min(1, { message: "Most likely should not be empty" })
        .max(1000, { message: "Should be at most 1000 characters" }),
});

export type ModifyCardData = z.infer<typeof ModifyCardSchema>;
