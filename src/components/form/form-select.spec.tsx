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
vi.mock("@/components/controlled-select");

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

    test.each([{ name: "select" }, { name: "deck" }, { name: "difficulty" }])(
        "should correctly forward form control and item name $name to 'FormField'",
        ({ name }) => {
            const mockControl: Control = fakeCompliantValue();

            render(<FormSelect control={mockControl} name={name} options={[]} innerLabel="" />);

            expect(mockedFormField).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ name, control: mockControl }),
                {},
            );
        },
    );

    test.each([{}, { label: "Select" }, { label: "Deck" }, { label: "Difficulty" }])(
        "should correctly render label $label inside the form item using 'FormLabel'",
        ({ label }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    label={label}
                    innerLabel=""
                />,
            );

            expect(mockedFormLabel).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ children: label }),
                {},
            );
        },
    );

    test.each([
        {},
        { description: "Select an item." },
        { description: "Assign card's deck." },
        { description: "Choose card's difficulty." },
    ])(
        "should correctly render label $label inside the form item using 'FormLabel'",
        ({ description }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    description={description}
                    innerLabel=""
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

    test.each([
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
    ])(
        "should correctly forward options $options to 'ControlledSelect' when rendering",
        ({ options }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={options}
                    innerLabel=""
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    options,
                }),
                {},
            );
        },
    );

    test.each([{ value: "o1" }, { value: "test_value" }, { value: "orange" }])(
        "should correctly forward form field's 'onChange' callback and value $value to 'ControlledSelect' when rendering",
        ({ value }) => {
            const mockOnChange = vi.fn();
            mockFormFieldWithField(mockedFormField, { value, onChange: mockOnChange });

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    innerLabel=""
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    value,
                    onValueChange: mockOnChange,
                }),
                {},
            );
        },
    );

    test.each([
        { placeholder: "Select a deck" },
        { placeholder: "Placeholder" },
        { placeholder: "Lorem ipsum" },
    ])(
        "should correctly forward placeholder $placeholder to 'ControlledSelect' when rendering",
        ({ placeholder }) => {
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

            expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    placeholder,
                }),
                {},
            );
        },
    );

    test.each([
        { innerLabel: "Group label" },
        { innerLabel: "Available decks" },
        { innerLabel: "Dolor sit amet" },
    ])(
        "should correctly forward placeholder $placeholder to 'ControlledSelect' when rendering",
        ({ innerLabel }) => {
            mockFormFieldWithField(mockedFormField);

            render(
                <FormSelect
                    control={fakeCompliantValue<Control>()}
                    name=""
                    options={[]}
                    innerLabel={innerLabel}
                />,
            );

            expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    innerLabel,
                }),
                {},
            );
        },
    );
});
