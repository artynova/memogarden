// Strictly client component

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/shadcn/select";

import { SelectOption } from "@/lib/utils/input";
import { ComponentProps, forwardRef } from "react";

/**
 * Dropdown selector with arbitrary options and externally managed state.
 *
 * @param props Component properties.
 * @param props.options Select options.
 * @param props.placeholder Placeholder shown in the selector when no options are selected.
 * @param props.innerLabel Single inner label shown at the top of the list in the selection dropdown.
 * @param props.value Current value.
 * @param props.onValueChange Value change callback.
 * @param props.className Custom classes.
 * @param props.id HTML ID.
 * @returns The component.
 */
const ControlledSelect = forwardRef<
    HTMLButtonElement,
    {
        options: SelectOption[];
        placeholder?: string;
        innerLabel?: string;
        value?: string;
        onValueChange: (value: string) => void;
    } & ComponentProps<"button">
>(({ options, placeholder, innerLabel, value, onValueChange, ...rest }, ref) => {
    return (
        <Select onValueChange={onValueChange} value={value}>
            <SelectTrigger ref={ref} {...rest}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{innerLabel}</SelectLabel>
                    {options.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
});
ControlledSelect.displayName = "ControlledSelect";

export { ControlledSelect };
