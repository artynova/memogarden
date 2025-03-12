import { Input } from "@/components/shadcn/input";
import { FormInput } from "@/components/form/form-input";
import {
    FormControl,
    FormDescription,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/shadcn/form";
import { fakeCompliantValue } from "@/test/mock/generic";
import { mockFormFieldWithField, replaceWithChildren } from "@/test/mock/react";
import { render } from "@testing-library/react";
import { Control } from "react-hook-form";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/shadcn/form", async (importOriginal) => {
    const original: object = await importOriginal();
    return {
        ...original,
        FormField: vi.fn(),
        FormLabel: vi.fn(),
        FormControl: vi.fn(),
        FormDescription: vi.fn(),
        FormMessage: vi.fn(),
    };
});
vi.mock("@/components/shadcn/input", () => ({
    Input: vi.fn(),
}));

const mockedFormField = vi.mocked(FormField);
const mockedFormLabel = vi.mocked(FormLabel);
const mockedFormControl = vi.mocked(FormControl);
const mockedFormDescription = vi.mocked(FormDescription);
const mockedFormMessage = vi.mocked(FormMessage);
const mockedInput = vi.mocked(Input);

describe(FormInput, () => {
    beforeEach(() => {
        replaceWithChildren(mockedFormControl);
    });

    test("should forward form control to 'FormField'", () => {
        const mockControl: Control = fakeCompliantValue("mock_control");

        render(<FormInput control={mockControl} name="" />);

        expect(mockedFormField).toHaveBeenCalledOnceWithProps({ control: mockControl });
    });

    describe.each([{ name: "name" }, { name: "deck" }, { name: "feedback" }])(
        "given field name $name",
        ({ name }) => {
            test("should forward field name to 'FormField'", () => {
                render(<FormInput control={fakeCompliantValue<Control>()} name={name} />);

                expect(mockedFormField).toHaveBeenCalledOnceWithProps({ name });
            });
        },
    );

    describe.each([{}, { label: "Lorem ipsum" }, { label: "Deck" }, { label: "Feedback" }])(
        "given label $label",
        ({ label }) => {
            test("should forward label to 'FormLabel'", () => {
                mockFormFieldWithField(mockedFormField);

                render(<FormInput control={fakeCompliantValue<Control>()} name="" label={label} />);

                expect(mockedFormLabel).toHaveBeenCalledOnceWithProps({ children: label });
            });
        },
    );

    describe.each([
        {},
        { description: "Input name." },
        { description: "Input deck." },
        { description: "Feedback about the app." },
    ])("given description $description", ({ description }) => {
        test("should forward description to 'FormDescription'", () => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormInput
                    control={fakeCompliantValue<Control>()}
                    name=""
                    description={description}
                />,
            );

            expect(mockedFormDescription).toHaveBeenCalledOnceWithProps({ children: description });
        });
    });

    test("should contain 'FormMessage'", () => {
        mockFormFieldWithField(mockedFormField);

        render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

        expect(mockedFormMessage).toHaveBeenCalledOnce();
    });

    describe("given no value for 'type' prop", () => {
        test("should use input type 'text'", () => {
            mockFormFieldWithField(mockedFormField);

            render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

            expect(mockedInput).toHaveBeenCalledOnceWithProps({ type: "text" });
        });
    });

    describe.each([{ type: "text" }, { type: "search" }, { type: "url" }])(
        "given value $type for 'type' prop",
        ({ type }) => {
            test("should correctly forward input type $type to 'Input' when rendering", () => {
                mockFormFieldWithField(mockedFormField);

                render(<FormInput control={fakeCompliantValue<Control>()} name="" type={type} />);

                expect(mockedInput).toHaveBeenCalledOnceWithProps({ type });
            });
        },
    );

    describe.each([
        { value: "Japanese" },
        { value: "Polish" },
        { value: "Lorem ipsum dolor sit amet" },
    ])("given form field value $value", ({ value }) => {
        test("should forward value to 'Input'", () => {
            mockFormFieldWithField(mockedFormField, { value });

            render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

            expect(mockedInput).toHaveBeenCalledOnceWithProps({ value });
        });
    });

    test("should forward form field 'onChange' callback to 'Input'", () => {
        const mockOnChange = vi.fn();
        mockFormFieldWithField(mockedFormField, { onChange: mockOnChange });

        render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

        expect(mockedInput).toHaveBeenCalledOnceWithProps({ onChange: mockOnChange });
    });
});
