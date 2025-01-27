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
}

export function ControlledSelect({
    options,
    placeholder,
    innerLabel,
    value,
    onValueChange,
    className,
}: ControlledSelectProps) {
    return (
        <Select onValueChange={onValueChange} value={value}>
            <SelectTrigger className={className}>
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
