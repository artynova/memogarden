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

    test.each([{ name: "name" }, { name: "deck" }, { name: "feedback" }])(
        "should correctly forward form control and item name $name to 'FormField'",
        ({ name }) => {
            const mockControl: Control = fakeCompliantValue();

            render(<FormInput control={mockControl} name={name} />);

            expect(mockedFormField).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ name, control: mockControl }),
                {},
            );
        },
    );

    test.each([{}, { label: "Lorem ipsum" }, { label: "Deck" }, { label: "Feedback" }])(
        "should correctly render label $label inside the form item using 'FormLabel'",
        ({ label }) => {
            mockFormFieldWithField(mockedFormField);

            render(<FormInput control={fakeCompliantValue<Control>()} name="" label={label} />);

            expect(mockedFormLabel).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ children: label }),
                {},
            );
        },
    );

    test.each([
        {},
        { description: "Input name." },
        { description: "Input deck." },
        { description: "Feedback about the app." },
    ])(
        "should correctly render label $label inside the form item using 'FormLabel'",
        ({ description }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormInput
                    control={fakeCompliantValue<Control>()}
                    name=""
                    description={description}
                />,
            );

            expect(mockedFormDescription).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ children: description }),
                {},
            );
        },
    );

    test("should use the 'FormMessage' component", () => {
        mockFormFieldWithField(mockedFormField);

        render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

        expect(mockedFormMessage).toHaveBeenCalledOnce();
    });

    test("should use input type 'text' when no type is provided", () => {
        mockFormFieldWithField(mockedFormField);

        render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

        expect(mockedInput).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                type: "text",
            }),
            {},
        );
    });

    test.each([{ type: "text" }, { type: "search" }, { type: "url" }])(
        "should correctly forward input type $type to 'Input' when rendering",
        ({ type }) => {
            mockFormFieldWithField(mockedFormField);

            render(<FormInput control={fakeCompliantValue<Control>()} name="" type={type} />);

            expect(mockedInput).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    type,
                }),
                {},
            );
        },
    );

    test.each([
        { value: "Japanese" },
        { value: "Polish" },
        { value: "Lorem ipsum dolor sit amet" },
    ])(
        "should correctly forward form field's 'onChange' callback and value $value to 'Input' when rendering",
        ({ value }) => {
            const mockOnChange = vi.fn();
            mockFormFieldWithField(mockedFormField, { value, onChange: mockOnChange });

            render(<FormInput control={fakeCompliantValue<Control>()} name="" />);

            expect(mockedInput).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    value,
                    onChange: mockOnChange,
                }),
                {},
            );
        },
    );
});
