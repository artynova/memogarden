// Client component. The "use client" directive is not present  because this is not a boundary
import { zodResolver } from "@hookform/resolvers/zod";
import { ModifyDeckData, ModifyDeckSchema } from "@/lib/validation-schemas";
import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/base/form";
import { FormInput } from "@/components/ui/form/form-input";
import { Button } from "@/components/ui/base/button";
import { Check, X } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(ModifyDeckSchema),
};

export type DeckFormProps = {
    onSubmit?: (data: ModifyDeckData) => void;
    onCancel?: () => void;
    /**
     * Default data for some fields in the form (e.g., when editing an already existing deck that has a name).
     */
    deck?: Partial<ModifyDeckData>;
};

export function DeckForm({ onSubmit, onCancel, deck }: DeckFormProps) {
    const defaultValues: ModifyDeckData = { name: deck?.name ?? "" };
    const form = useForm<ModifyDeckData>({ ...formConfig, defaultValues });

    function onSubmitInternal(data: ModifyDeckData) {
        if (onSubmit) onSubmit(data);
    }

    return (
        <Form {...form}>
            <form
                className={"space-y-2"}
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmitInternal))}
            >
                <FormInput control={form.control} name="name" label="Name" />
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
