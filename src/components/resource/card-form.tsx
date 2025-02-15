// Strictly client component

import { zodResolver } from "@hookform/resolvers/zod";
import { ModifyCardData, ModifyCardSchema } from "@/server/actions/card/schemas";
import React, { useState } from "react";
import { useForm, UseFormProps } from "react-hook-form";
import { Form } from "@/components/shadcn/form";
import { Button } from "@/components/shadcn/button";
import { BookOpen, Check, Pencil, X } from "lucide-react";
import { FormSelect } from "@/components/form/form-select";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { FormMarkdownInput } from "@/components/form/markdown/form-markdown-input";
import { Toggle } from "@/components/shadcn/toggle";

import { SelectOption } from "@/lib/utils/input";

const formConfig: UseFormProps<ModifyCardData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(ModifyCardSchema),
};

/**
 * Form for inputting information necessary to modify (create or update) a card.
 *
 * Strictly client component, must be used within the client boundary.
 *
 * @param props Component properties.
 * @param props.onSubmit Submission callback.
 * @param props.onCancel Cancellation callback.
 * @param props.deckOptions Options for the card deck selection field.
 * @param props.card Initial card data to populate form fields with (e.g., when updating an existing card).
 * @returns The component.
 */
export function CardForm({
    onSubmit,
    onCancel,
    deckOptions,
    card,
}: {
    onSubmit: (data: ModifyCardData) => void;
    onCancel: () => void;
    deckOptions: SelectOption[];
    /**
     * Default data for some fields in the form (e.g., when editing an already existing card).
     */
    card?: Partial<ModifyCardData>;
}) {
    const defaultValues: ModifyCardData = {
        deckId: card?.deckId ?? "",
        front: card?.front ?? "",
        back: card?.back ?? "",
    };
    const form = useForm<ModifyCardData>({ ...formConfig, defaultValues });
    const [preview, setPreview] = useState(false);

    function onSubmitInternal(data: ModifyCardData) {
        onSubmit(data);
    }

    return (
        <Form {...form}>
            <form
                className={"space-y-3"}
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmitInternal))}
            >
                <FormSelect
                    control={form.control}
                    name="deckId"
                    options={deckOptions}
                    placeholder={"Select a deck"}
                    label="Deck"
                    innerLabel={"Your decks"}
                />
                <FormMarkdownInput
                    preview={preview}
                    control={form.control}
                    name="front"
                    label="Front"
                />
                <FormMarkdownInput
                    preview={preview}
                    control={form.control}
                    name="back"
                    label="Back"
                />
                <Toggle pressed={preview} onPressedChange={setPreview}>
                    <span>{preview ? "Disable preview" : "Enable preview"}</span>
                    {preview ? (
                        <Pencil aria-label={"Disable preview icon"} />
                    ) : (
                        <BookOpen aria-label={"Enable preview icon"} />
                    )}
                </Toggle>
                <div className={"flex justify-center space-x-2"}>
                    <Button size={"lg"}>
                        <span>Save</span>
                        <Check aria-label={"Save icon"} />
                    </Button>
                    <Button size={"lg"} variant={"outline"} onClick={onCancel} type={"button"}>
                        <span>Cancel</span>
                        <X aria-label={"Cancel icon"} />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
