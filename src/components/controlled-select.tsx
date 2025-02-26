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
export function ControlledSelect({
    options,
    placeholder,
    innerLabel,
    value,
    onValueChange,
    className,
    id,
}: {
    options: SelectOption[];
    placeholder?: string;
    innerLabel?: string;
    value?: string;
    onValueChange: (value: string) => void;
    className?: string;
    id?: string;
}) {
    return (
        <Select onValueChange={onValueChange} value={value}>
            <SelectTrigger id={id} className={className} aria-label={innerLabel}>
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
}
