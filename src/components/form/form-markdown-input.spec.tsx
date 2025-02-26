import { ControlledMarkdownInput } from "@/components/markdown/controlled-markdown-input";
import { FormMarkdownInput } from "@/components/form/form-markdown-input";
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
import { MarkdownProse } from "@/components/markdown/markdown-prose";

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
vi.mock("@/components/markdown/controlled-markdown-input", () => ({
    ControlledMarkdownInput: vi.fn(),
}));
vi.mock("@/components/markdown/markdown-prose");

const mockedFormField = vi.mocked(FormField);
const mockedFormLabel = vi.mocked(FormLabel);
const mockedFormControl = vi.mocked(FormControl);
const mockedFormDescription = vi.mocked(FormDescription);
const mockedFormMessage = vi.mocked(FormMessage);
const mockedControlledMarkdownInput = vi.mocked(ControlledMarkdownInput);
const mockedMarkdownProse = vi.mocked(MarkdownProse);

describe(FormMarkdownInput, () => {
    beforeEach(() => {
        replaceWithChildren(mockedFormControl);
    });

    test.each([{ name: "front" }, { name: "back" }, { name: "feedback" }])(
        "should correctly forward form control and item name $name to 'FormField'",
        ({ name }) => {
            const mockControl: Control = fakeCompliantValue();

            render(<FormMarkdownInput control={mockControl} name={name} />);

            expect(mockedFormField).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ name, control: mockControl }),
                {},
            );
        },
    );

    test.each([{}, { label: "Front" }, { label: "Back" }, { label: "Feedback" }])(
        "should correctly render label $label inside the form item using 'FormLabel'",
        ({ label }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormMarkdownInput control={fakeCompliantValue<Control>()} name="" label={label} />,
            );

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
                <FormMarkdownInput
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

        render(<FormMarkdownInput control={fakeCompliantValue<Control>()} name="" />);

        expect(mockedFormMessage).toHaveBeenCalledOnce();
    });

    test.each([{ value: "Hello" }, { value: "Text" }, { value: "dolor sit amet" }])(
        "should correctly forward form field's 'onChange' callback and value $value to 'ControlledMarkdownInput' when rendering in edit mode",
        ({ value }) => {
            const mockOnChange = vi.fn();
            mockFormFieldWithField(mockedFormField, { value, onChange: mockOnChange });

            render(
                <FormMarkdownInput
                    control={fakeCompliantValue<Control>()}
                    name=""
                    preview={false}
                />,
            );

            expect(mockedControlledMarkdownInput).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    value,
                    onChange: mockOnChange,
                }),
                {},
            );
        },
    );

    test.each([{ value: "Hello" }, { value: "Text" }, { value: "dolor sit amet" }])(
        "should correctly forward form field's value $value to 'MarkdownProse' as children when rendering in preview mode",
        ({ value }) => {
            mockFormFieldWithField(mockedFormField, { value });

            render(
                <FormMarkdownInput
                    control={fakeCompliantValue<Control>()}
                    name=""
                    preview={true}
                />,
            );

            expect(mockedMarkdownProse).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    children: value,
                }),
                {},
            );
        },
    );
});
