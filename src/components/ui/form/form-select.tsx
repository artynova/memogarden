import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/base/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { SelectOption } from "@/lib/ui";
import { ControlledSelect } from "@/components/ui/controlled-select";

export interface FormSelectProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    control: Control<TFieldValues>;
    name: TName;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    innerLabel: string;
    description?: string;
    className?: string;
}

export function FormSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    options,
    placeholder,
    label,
    innerLabel,
    description,
    className,
}: FormSelectProps<TFieldValues, TName>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <ControlledSelect
                            options={options}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={placeholder}
                            innerLabel={innerLabel}
                        />
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
