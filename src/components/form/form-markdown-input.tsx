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
import { MarkdownProse } from "@/components/markdown/markdown-prose";
import { ControlledMarkdownInput } from "@/components/markdown/controlled-markdown-input";

/**
 * Form input field that allows inputting Markdown with syntax highlighting in the CodeMirror editor instead of plain
 * text. The field also has a "preview" mode, where it is not editable and, instead of the CodeMirror editor, it shows
 * the rendered version of the Markdown code.
 *
 * @param props Component properties.
 * @param props.control Form control.
 * @param props.name Field name.
 * @param props.label Field label.
 * @param props.description Field description.
 * @param props.preview Whether to render the field in "preview" mode (off by default).
 * @param props.className Custom classes.
 * @returns The component.
 */
export function FormMarkdownInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    description,
    preview,
    className,
}: {
    control: Control<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    preview?: boolean;
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
                        {preview ? (
                            <div className="flex min-h-9 max-w-full items-center rounded-md border border-input px-3 py-1">
                                <MarkdownProse className="max-w-full">{field.value}</MarkdownProse>
                            </div>
                        ) : (
                            <ControlledMarkdownInput {...field} />
                        )}
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
