import { z } from "zod";

/**
 * Schema for the user input required to create or update a card.
 */
export const ModifyCardSchema = z.object({
    deckId: z.string().min(1, { message: "Required" }), // To trigger an error in the select field if no option is selected
    front: z
        .string()
        .min(1, { message: "Required" })
        .max(300, { message: "Must be at most 300 characters" }),
    back: z
        .string()
        .min(1, { message: "Required" })
        .max(1000, { message: "Must be at most 1000 characters" }),
});

/**
 * Data for modifying a card, based on the corresponding schema.
 */
export type ModifyCardData = z.infer<typeof ModifyCardSchema>;
