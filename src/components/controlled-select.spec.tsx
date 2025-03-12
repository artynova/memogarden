import { describe, expect, test, vi } from "vitest";
import { ControlledSelect } from "@/components/controlled-select";
import { fireEvent, render, screen } from "@testing-library/react";

describe(ControlledSelect, () => {
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
        describe.each(
            options.map((currentOption, currentIndex) => ({ currentOption, currentIndex })),
        )("given current option $option", ({ currentOption, currentIndex }) => {
            test("should render option label in the trigger button", () => {
                render(
                    <ControlledSelect
                        value={currentOption.value}
                        onValueChange={() => {}}
                        options={options}
                    />,
                );
                const trigger = screen.getByRole("combobox");

                expect(trigger).toHaveTextContent(currentOption.label);
            });

            describe("when select dropdown is expanded", () => {
                describe.each(options.map((option, index) => ({ option, index })))(
                    "for option $option",
                    ({ option, index }) => {
                        test(`should render option label ${option.label}`, () => {
                            render(
                                <ControlledSelect
                                    value={currentOption.value}
                                    onValueChange={() => {}}
                                    options={options}
                                />,
                            );
                            const trigger = screen.getByRole("combobox");
                            fireEvent.click(trigger);
                            const optionElement = screen.queryByRole("option", {
                                name: option.label,
                            });

                            expect(optionElement).toBeInTheDocument();
                            expect(optionElement).toHaveTextContent(option.label);
                        });

                        if (index === currentIndex) {
                            test("should render option as checked", () => {
                                render(
                                    <ControlledSelect
                                        value={currentOption.value}
                                        onValueChange={() => {}}
                                        options={options}
                                    />,
                                );
                                const trigger = screen.getByRole("combobox");
                                fireEvent.click(trigger);
                                const optionElement = screen.getAllByRole("option")[index];

                                expect(optionElement).toHaveAttribute("data-state", "checked");
                            });

                            describe("when option is clicked", () => {
                                test("should not call 'onValueChange' callback", () => {
                                    const mockOnValueChange = vi.fn();

                                    render(
                                        <ControlledSelect
                                            value={currentOption.value}
                                            onValueChange={mockOnValueChange}
                                            options={options}
                                        />,
                                    );
                                    const trigger = screen.getByRole("combobox");
                                    fireEvent.click(trigger);
                                    const optionElement = screen.getByRole("option", {
                                        name: option.label,
                                    });
                                    fireEvent.click(optionElement);

                                    expect(mockOnValueChange).not.toHaveBeenCalled();
                                });
                            });
                        } else {
                            test("should render option as unchecked", () => {
                                render(
                                    <ControlledSelect
                                        value={currentOption.value}
                                        onValueChange={() => {}}
                                        options={options}
                                    />,
                                );
                                const trigger = screen.getByRole("combobox");
                                fireEvent.click(trigger);
                                const optionElement = screen.getAllByRole("option")[index];

                                expect(optionElement).toHaveAttribute("data-state", "unchecked");
                            });

                            describe("when option is clicked", () => {
                                test("should call 'onValueChange' callback with option value", () => {
                                    const mockOnValueChange = vi.fn();

                                    render(
                                        <ControlledSelect
                                            value={currentOption.value}
                                            onValueChange={mockOnValueChange}
                                            options={options}
                                        />,
                                    );
                                    const trigger = screen.getByRole("combobox");
                                    fireEvent.click(trigger);
                                    const optionElement = screen.getByRole("option", {
                                        name: option.label,
                                    });
                                    fireEvent.click(optionElement);

                                    expect(mockOnValueChange).toHaveBeenCalledExactlyOnceWith(
                                        option.value,
                                    );
                                });
                            });
                        }
                    },
                );
            });
        });
    });
});
