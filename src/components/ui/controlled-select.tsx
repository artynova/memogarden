import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/base/select";
import { SelectOption } from "@/lib/ui";

export interface ControlledSelectProps {
    options: SelectOption[];
    placeholder?: string;
    innerLabel?: string;
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    id?: string;
}

export function ControlledSelect({
    options,
    placeholder,
    innerLabel,
    value,
    onValueChange,
    className,
    id,
}: ControlledSelectProps) {
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
