import { ModifyCardSchema } from "@/server/actions/card/schemas";
import { describe, expect, test } from "vitest";

describe("ModifyCardSchema", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([{ error: "Required" }, { deckId: "", error: "Required" }])(
            "given input data with invalid deck ID $deckId",
            ({ deckId, error }) => {
                test(`should report first deck ID error '${error}'`, () => {
                    const output = ModifyCardSchema.safeParse({ deckId });

                    expect(output).toHaveFirstParsingError("deckId", error);
                });
            },
        );

        describe.each([
            { error: "Required" },
            { front: "", error: "Required" },
            { front: "a".repeat(301), error: "Must be at most 300 characters" },
        ])("given input data with invalid front text $front", ({ front, error }) => {
            test(`should report first front error '${error}'`, () => {
                const output = ModifyCardSchema.safeParse({ front });

                expect(output).toHaveFirstParsingError("front", error);
            });
        });

        describe.each([
            { error: "Required" },
            { back: "", error: "Required" },
            { back: "a".repeat(1001), error: "Must be at most 1000 characters" },
        ])("given input data with invalid back text $front", ({ back, error }) => {
            test(`should report first back error '${error}'`, () => {
                const output = ModifyCardSchema.safeParse({ back });

                expect(output).toHaveFirstParsingError("back", error);
            });
        });

        describe.each([
            { data: { deckId: "deck1", front: "Hello", back: "H**a**llo" } },
            { data: { deckId: "deck2", front: "hello".repeat(60), back: "hallo".repeat(200) } },
        ])("given valid input data $data", ({ data }) => {
            test("should output successfully parsed data", () => {
                const output = ModifyCardSchema.safeParse(data);

                expect(output.data).toEqual(data);
            });
        });
    });
});
