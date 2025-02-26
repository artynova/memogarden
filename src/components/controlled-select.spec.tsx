import { describe, expect, test, vi } from "vitest";
import { ControlledSelect } from "@/components/controlled-select";
import { fireEvent, render, screen } from "@testing-library/react";
import { stringifyWithSingleSpaces } from "@/test/display";

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
])(ControlledSelect, ({ options }) => {
    const optionsString = stringifyWithSingleSpaces(options);

    test.each([{ currentIndex: 0 }, { currentIndex: 1 }, { currentIndex: 2 }])(
        `should correctly render the current option's label in the trigger button when given option at index $currentIndex in options list ${optionsString}`,
        ({ currentIndex }) => {
            render(
                <ControlledSelect
                    value={options[currentIndex].value}
                    onValueChange={() => {}}
                    options={options}
                />,
            );
            const trigger = screen.getByRole("combobox");

            expect(trigger).toHaveTextContent(options[currentIndex].label);
        },
    );

    test.each([{ placeholder: "Select an item" }, { placeholder: "Choose something" }])(
        `should correctly render placeholder text when placeholder $placeholder is passed and no value is selected`,
        ({ placeholder }) => {
            render(
                <ControlledSelect
                    placeholder={placeholder}
                    value={undefined}
                    onValueChange={() => {}}
                    options={options}
                />,
            );
            const trigger = screen.getByRole("combobox");

            expect(trigger).toHaveTextContent(placeholder);
        },
    );

    test.each([{ label: "Items" }, { label: "Options" }, { label: "Test Label" }])(
        `should correctly render inner label for selection options when passed label $label`,
        ({ label }) => {
            render(
                <ControlledSelect
                    innerLabel={label}
                    value={undefined}
                    onValueChange={() => {}}
                    options={options}
                />,
            );
            const trigger = screen.getByRole("combobox");
            fireEvent.click(trigger);
            const labelElement = screen.getByRole("group").firstChild;

            expect(labelElement).toHaveTextContent(label);
        },
    );

    test(`should render select options correctly when given options list ${optionsString}`, () => {
        render(<ControlledSelect value={undefined} onValueChange={() => {}} options={options} />);
        const trigger = screen.getByRole("combobox");
        fireEvent.click(trigger);
        const optionElements = screen.getAllByRole("option");

        expect(optionElements.length).toEqual(options.length);
        optionElements.forEach((element, index) => {
            expect(element).toHaveTextContent(options[index].label);
        });
    });

    test.each([{ currentIndex: 0 }, { currentIndex: 1 }, { currentIndex: 2 }])(
        `should mark the current option and only the current option as selected when given option at index $currentIndex in options list ${optionsString}`,
        ({ currentIndex }) => {
            render(
                <ControlledSelect
                    value={options[currentIndex].value}
                    onValueChange={() => {}}
                    options={options}
                />,
            );
            const trigger = screen.getByRole("combobox");
            fireEvent.click(trigger);

            const optionElements = screen.getAllByRole("option");

            optionElements.forEach((element, index) => {
                if (index === currentIndex) {
                    expect(element).toHaveAttribute("data-state", "checked");
                    expect(element).toHaveTextContent(options[currentIndex].label);
                } else expect(element).toHaveAttribute("data-state", "unchecked");
            });
        },
    );

    test.each([
        {
            currentIndex: 0,
            targetIndex: 0,
        },
        {
            currentIndex: 0,
            targetIndex: 1,
        },
        {
            currentIndex: 0,
            targetIndex: 2,
        },
        {
            currentIndex: 2,
            targetIndex: 0,
        },
    ])(
        `should handle clicking on an option correctly when given option at index $currentIndex in options list ${optionsString} and target option at index $targetIndex`,
        ({ currentIndex, targetIndex }) => {
            const mockOnValueChange = vi.fn();

            render(
                <ControlledSelect
                    value={options[currentIndex].value}
                    onValueChange={mockOnValueChange}
                    options={options}
                />,
            );
            const trigger = screen.getByRole("combobox");
            fireEvent.click(trigger);
            const optionElement = screen.getByRole("option", { name: options[targetIndex].label });
            fireEvent.click(optionElement);

            if (options[currentIndex].value === options[targetIndex].value)
                expect(mockOnValueChange).not.toHaveBeenCalled(); // Change callback should not get triggered when clicking on the already selected option
            else expect(mockOnValueChange).toHaveBeenCalledWith(options[targetIndex].value);
        },
    );
});
