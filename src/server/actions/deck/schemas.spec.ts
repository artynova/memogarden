import { ModifyDeckSchema } from "@/server/actions/deck/schemas";
import { describe, expect, test } from "vitest";

describe("ModifyDeckSchema", () => {
    describe("when schema's 'safeParse' is called", () => {
        describe.each([
            { error: "Required" },
            { name: "", error: "Required" },
            { name: "a".repeat(101), error: "Must be at most 100 characters" },
        ])("given input data with invalid name $name", ({ name, error }) => {
            test(`should report first name error '${error}'`, () => {
                const output = ModifyDeckSchema.safeParse({ name });

                expect(output).toHaveFirstParsingError("name", error);
            });
        });

        describe.each([{ data: { name: "Japanese" } }, { data: { name: "Polish" } }])(
            "given valid input data $data",
            ({ data }) => {
                test("should output successfully parsed data", () => {
                    const output = ModifyDeckSchema.safeParse(data);

                    expect(output.data).toEqual(data);
                });
            },
        );
    });
});
