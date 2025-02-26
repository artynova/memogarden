// Strictly client component

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadcn/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { ControlledSelect } from "@/components/controlled-select";

import { SelectOption } from "@/lib/utils/input";

/**
 * Select-based form field.
 *
 * @param props Component properties.
 * @param props.control Form control.
 * @param props.name Field name.
 * @param props.options Allowed selection options.
 * @param props.placeholder Placeholder shown in the field before any option is selected.
 * @param props.label Field label.
 * @param props.innerLabel Label that is shown in the selection dropdown.
 * @param props.description Field description.
 * @param props.className Custom classes.
 * @returns The component.
 */
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
}: {
    control: Control<TFieldValues>;
    name: TName;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    innerLabel: string;
    description?: string;
    className?: string;
}) {
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
