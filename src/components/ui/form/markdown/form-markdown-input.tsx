"use client";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/base/form";
import { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import React, { useImperativeHandle, useRef, useState } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { cn } from "@/lib/utils";
import { markdown } from "@codemirror/lang-markdown";
import { memoGarden } from "@/components/ui/form/markdown/codemirror-theme";
import Markdown from "react-markdown";

export interface FormMarkdownInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    control: Control<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    preview?: boolean;
    className?: string;
}

/**
 * Form input field that allows inputting Markdown with syntax highlighting in the CodeMirror editor instead of
 * plain text. The field also has a "preview" mode, where it is not editable and, instead of the CodeMirror editor,
 * it shows the rendered version of the Markdown code.
 *
 * @param control Form control.
 * @param name Field name.
 * @param label Field label.
 * @param description Field description (optional).
 * @param preview Whether to render the field in "preview" mode (optional, off by default).
 * @param className Custom CSS classes to override standard styles (optional).
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
}: FormMarkdownInputProps<TFieldValues, TName>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        {preview ? (
                            <Markdown
                                className={
                                    "prose min-h-9 max-w-full rounded-md border border-input px-3 py-1 text-base md:text-sm"
                                }
                            >
                                {field.value}
                            </Markdown>
                        ) : (
                            <CodeMirrorAdapter {...field} />
                        )}
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function CodeMirrorAdapter<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    onChange,
    onBlur,
    value,
    disabled,
    ref,
    // There is no way to attach the standard form input's "name" attribute to the CodeMirror editor because it does not use standard input elements, but the form submission still works without the name
}: ControllerRenderProps<TFieldValues, TName>) {
    const [editorFocused, setEditorFocused] = useState(false);
    const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

    // Directly expose the top-level editor element via the ref
    useImperativeHandle(ref, () => codeMirrorRef.current?.editor);

    function onFocus() {
        setEditorFocused(true);
    }

    function onBlurInternal() {
        setEditorFocused(false);
        onBlur();
    }

    return (
        <CodeMirror
            className={cn(
                "min-h-9 w-full overflow-hidden rounded-md border bg-transparent px-3 py-1 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                editorFocused ? "outline-none ring-1 ring-ring" : "", // CodeMirror does not support standard HTML focusing and instead uses its own focus state, which is why CSS selectors do not work here and the focus state is observed via callbacks
            )}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlurInternal}
            value={value}
            editable={!disabled}
            extensions={[markdown(), memoGarden]}
            ref={codeMirrorRef}
        />
    );
}
