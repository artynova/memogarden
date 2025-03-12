import { ControlledSelect } from "@/components/controlled-select";
import { FormSelect } from "@/components/form/form-select";
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
vi.mock("@/components/controlled-select", () => ({
    ControlledSelect: vi.fn(),
}));

const mockedFormField = vi.mocked(FormField);
const mockedFormLabel = vi.mocked(FormLabel);
const mockedFormControl = vi.mocked(FormControl);
const mockedFormDescription = vi.mocked(FormDescription);
const mockedFormMessage = vi.mocked(FormMessage);
const mockedControlledSelect = vi.mocked(ControlledSelect);

describe(FormSelect, () => {
    beforeEach(() => {
        replaceWithChildren(mockedFormControl);
    });

    test("should forward form control to 'FormField'", () => {
        const mockControl: Control = fakeCompliantValue("mock_control");

        render(<FormSelect control={mockControl} name="" options={[]} innerLabel="" />);

        expect(mockedFormField).toHaveBeenCalledOnceWithProps({ control: mockControl });
    });

    describe.each([{ name: "select" }, { name: "deck" }, { name: "difficulty" }])(
        "given field name $name",
        ({ name }) => {
            test("should forward field name to 'FormField'", () => {
                render(
                    <FormSelect
                        control={fakeCompliantValue<Control>()}
                        name={name}
                        options={[]}
                        innerLabel=""
                    />,
                );

                expect(mockedFormField).toHaveBeenCalledOnceWithProps({ name });
            });
        },
    );

    describe.each([{}, { label: "Select" }, { label: "Deck" }, { label: "Difficulty" }])(
        "given label $label",
        ({ label }) => {
            test("should forward label to 'FormLabel'", () => {
                mockFormFieldWithField(mockedFormField);

                render(
                    <FormSelect
                        control={fakeCompliantValue<Control>()}
                        name=""
                        options={[]}
                        innerLabel=""
                        label={label}
                    />,
                );

                expect(mockedFormLabel).toHaveBeenCalledOnceWithProps({ children: label });
            });
        },
    );

    describe.each([
        {},
        { description: "Select an item." },
        { description: "Assign card's deck." },
        { description: "Choose card's difficulty." },
    ])("given description $description", ({ description }) => {
        test("should forward description to 'FormDescription'", () => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    innerLabel=""
                    description={description}
                />,
            );

            expect(mockedFormDescription).toHaveBeenCalledOnceWithProps({ children: description });
        });
    });

    test("should contain 'FormMessage'", () => {
        mockFormFieldWithField(mockedFormField);

        render(
            <FormSelect
                control={fakeCompliantValue<Control>()}
                name=""
                options={[]}
                innerLabel=""
            />,
        );

        expect(mockedFormMessage).toHaveBeenCalledOnce();
    });

    describe.each([
        {
            options: [
                { label: "Option 1", value: "option3" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option1" },
            ],
        },
        {
            options: [
                { label: "Apple", value: "fruit1" },
                { label: "Orange", value: "fruit2" },
                { label: "Banana", value: "fruit3" },
                { label: "Melon", value: "fruit4" },
            ],
        },
    ])("given options $options", ({ options }) => {
        test("should forward options to 'ControlledSelect'", () => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={options}
                    innerLabel=""
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({ options });
        });
    });

    describe.each([
        { placeholder: "Select a deck" },
        { placeholder: "Placeholder" },
        { placeholder: "Lorem ipsum" },
    ])("given placeholder $placeholder", ({ placeholder }) => {
        test("should forward placeholder to 'ControlledSelect'", () => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    placeholder={placeholder}
                    innerLabel=""
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({ placeholder });
        });
    });

    describe.each([
        { innerLabel: "Group label" },
        { innerLabel: "Available decks" },
        { innerLabel: "Dolor sit amet" },
    ])("given inner label $innerLabel", ({ innerLabel }) => {
        test("should forward placeholder to 'ControlledSelect'", () => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    innerLabel={innerLabel}
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({ innerLabel });
        });
    });

    describe.each([{ value: "o1" }, { value: "test_value" }, { value: "orange" }])(
        "given form field value $value",
        ({ value }) => {
            test("should forward value to 'ControlledSelect'", () => {
                mockFormFieldWithField(mockedFormField, { value });

                render(
                    <FormSelect
                        control={fakeCompliantValue<Control>()}
                        name=""
                        options={[]}
                        innerLabel=""
                    />,
                );

                expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({ value });
            });
        },
    );

    test("should forward form field 'onChange' callback to 'ControlledSelect'", () => {
        const mockOnChange = vi.fn();
        mockFormFieldWithField(mockedFormField, { onChange: mockOnChange });

        render(
            <FormSelect
                control={fakeCompliantValue<Control>()}
                name=""
                options={[]}
                innerLabel=""
            />,
        );

        expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({
            onValueChange: mockOnChange,
        });
    });
});
