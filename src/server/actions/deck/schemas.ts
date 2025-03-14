import { z } from "zod";

/**
 * Schema for the user input required to create or update a deck.
 */
export const ModifyDeckSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Required" })
        .max(100, { message: "Must be at most 100 characters" }),
});
/**
 * Data for modifying a deck, based on the corresponding schema.
 */
export type ModifyDeckData = z.infer<typeof ModifyDeckSchema>;
