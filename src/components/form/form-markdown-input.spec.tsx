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

    describe.each([{ preview: true }, { preview: false }, { preview: undefined }])(
        "given value $preview for 'preview' prop",
        ({ preview }) => {
            test("should forward form control to 'FormField'", () => {
                const mockControl: Control = fakeCompliantValue("mock_control");

                render(<FormMarkdownInput control={mockControl} name="" />);

                expect(mockedFormField).toHaveBeenCalledOnceWithProps({ control: mockControl });
            });

            describe.each([{ name: "name" }, { name: "front" }, { name: "back" }])(
                "given field name $name",
                ({ name }) => {
                    test("should forward field name to 'FormField'", () => {
                        render(
                            <FormMarkdownInput
                                control={fakeCompliantValue<Control>()}
                                name={name}
                            />,
                        );

                        expect(mockedFormField).toHaveBeenCalledOnceWithProps({ name });
                    });
                },
            );

            describe.each([
                {},
                { label: "Lorem ipsum" },
                { label: "Question" },
                { label: "Answer" },
            ])("given label $label", ({ label }) => {
                test("should forward label to 'FormLabel'", () => {
                    mockFormFieldWithField(mockedFormField);

                    render(
                        <FormMarkdownInput
                            control={fakeCompliantValue<Control>()}
                            name=""
                            label={label}
                        />,
                    );

                    expect(mockedFormLabel).toHaveBeenCalledOnceWithProps({ children: label });
                });
            });

            describe.each([
                {},
                { description: "Lorem ipsum." },
                { description: "Input question Markdown." },
                { description: "Input answer Markdown." },
            ])("given description $description", ({ description }) => {
                test("should forward description to 'FormDescription'", () => {
                    mockFormFieldWithField(mockedFormField);

                    render(
                        <FormMarkdownInput
                            control={fakeCompliantValue<Control>()}
                            name=""
                            description={description}
                        />,
                    );

                    expect(mockedFormDescription).toHaveBeenCalledOnceWithProps({
                        children: description,
                    });
                });
            });

            test("should contain 'FormMessage'", () => {
                mockFormFieldWithField(mockedFormField);

                render(<FormMarkdownInput control={fakeCompliantValue<Control>()} name="" />);

                expect(mockedFormMessage).toHaveBeenCalledOnce();
            });

            if (preview) {
                describe.each([
                    { value: "Hello" },
                    { value: "**Text**" },
                    { value: "dolor _sit_ amet" },
                ])("given form field value $value", ({ value }) => {
                    test("should forward value to 'ControlledMarkdownInput'", () => {
                        mockFormFieldWithField(mockedFormField, { value });

                        render(
                            <FormMarkdownInput
                                control={fakeCompliantValue<Control>()}
                                name=""
                                preview={false}
                            />,
                        );

                        expect(mockedControlledMarkdownInput).toHaveBeenCalledOnceWithProps({
                            value,
                        });
                    });
                });

                test("should forward form field 'onChange' callback to 'ControlledMarkdownInput'", () => {
                    const mockOnChange = vi.fn();
                    mockFormFieldWithField(mockedFormField, { onChange: mockOnChange });

                    render(<FormMarkdownInput control={fakeCompliantValue<Control>()} name="" />);

                    expect(mockedControlledMarkdownInput).toHaveBeenCalledOnceWithProps({
                        onChange: mockOnChange,
                    });
                });
            } else {
                describe.each([
                    { value: "Hello" },
                    { value: "**Text**" },
                    { value: "dolor _sit_ amet" },
                ])("given form field value $value", ({ value }) => {
                    test("should forward value to 'MarkdownProse'", () => {
                        mockFormFieldWithField(mockedFormField, { value });

                        render(
                            <FormMarkdownInput
                                control={fakeCompliantValue<Control>()}
                                name=""
                                preview={true}
                            />,
                        );

                        expect(mockedMarkdownProse).toHaveBeenCalledOnceWithProps({
                            children: value,
                        });
                    });
                });
            }
        },
    );
});
