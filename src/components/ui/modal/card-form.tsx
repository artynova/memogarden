// Client component. The "use client" directive is not present  because this is not a boundary
import { zodResolver } from "@hookform/resolvers/zod";
import { ModifyCardData, ModifyCardSchema } from "@/lib/validation-schemas";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/base/form";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import { Button } from "@/components/ui/base/button";
import { Check, X } from "lucide-react";
import { SelectOption, SelectWithLabel } from "@/components/ui/form/select-with-label";
import { ignoreAsyncFnResult } from "@/lib/utils";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(ModifyCardSchema),
};

export type CardFormProps = {
    onSubmit?: (data: ModifyCardData) => void;
    onCancel?: () => void;
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

    function onSubmitInternal(data: ModifyCardData) {
        if (onSubmit) onSubmit(data);
    }

    return (
        <Form {...form}>
            <form
                className={"space-y-2"}
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmitInternal))}
            >
                <SelectWithLabel
                    control={form.control}
                    name="deckId"
                    options={deckOptions}
                    placeholder={"Select a deck"}
                    label="Deck"
                    innerLabel={"Your decks"}
                />
                <InputWithLabel control={form.control} name="front" label="Front" />
                <InputWithLabel control={form.control} name="back" label="Back" />
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
