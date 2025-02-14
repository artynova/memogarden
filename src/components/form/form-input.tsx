import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { HTMLInputTypeAttribute } from "react";

/**
 * Standard text input form field of a specific type.
 *
 * @param props Component properties.
 * @param props.control Form control.
 * @param props.name Field name.
 * @param props.label Field label.
 * @param props.description Field description.
 * @param props.className Custom classes.
 * @param props.type Input type (defaults to "text").
 * @returns The component.
 */
export function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    description,
    className,
    type = "text",
}: {
    control: Control<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    className?: string;
    type?: HTMLInputTypeAttribute;
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={type} {...field} />
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
