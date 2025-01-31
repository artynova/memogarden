// Client component. The "use client" directive is not present because this is not a boundary
import { zodResolver } from "@hookform/resolvers/zod";
import { ModifyCardData, ModifyCardSchema } from "@/lib/validation-schemas";
import React, { useState } from "react";
import { useForm, UseFormProps } from "react-hook-form";
import { Form } from "@/components/ui/base/form";
import { Button } from "@/components/ui/base/button";
import { BookOpen, Check, Pencil, X } from "lucide-react";
import { FormSelect } from "@/components/ui/form/form-select";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { FormMarkdownInput } from "@/components/ui/form/markdown/form-markdown-input";
import { Toggle } from "@/components/ui/base/toggle";
import { SelectOption } from "@/lib/ui";

const formConfig: UseFormProps<ModifyCardData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(ModifyCardSchema),
};

export type CardFormProps = {
    onSubmit: (data: ModifyCardData) => void;
    onCancel: () => void;
    deckOptions: SelectOption[];
    /**
     * Default data for some fields in the form (e.g., when editing an already existing card).
     */
    card?: Partial<ModifyCardData>;
};

export function CardForm({ onSubmit, onCancel, deckOptions, card }: CardFormProps) {
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
                <Toggle className={""} pressed={preview} onPressedChange={setPreview}>
                    <span>{preview ? "Disable Preview" : "Enable Preview"}</span>
                    {preview ? <Pencil /> : <BookOpen />}
                </Toggle>
                <div className={"flex justify-center space-x-2"}>
                    <Button size={"lg"}>
                        <span>Save</span>
                        <Check />
                    </Button>
                    <Button size={"lg"} variant={"outline"} onClick={onCancel} type={"button"}>
                        <span>Cancel</span>
                        <X />
                    </Button>
                </div>
            </form>
        </Form>
    );
}
