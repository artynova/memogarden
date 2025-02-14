// Strictly client component

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, UseFormProps } from "react-hook-form";
import { Form } from "@/components/shadcn/form";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/shadcn/button";
import { Check, X } from "lucide-react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { ModifyDeckData, ModifyDeckSchema } from "@/server/actions/deck/schemas";

const formConfig: UseFormProps<ModifyDeckData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(ModifyDeckSchema),
};

/**
 * Form for inputting information necessary to modify (create or update) a deck.
 *
 * @param props Component properties.
 * @param props.onSubmit Submission callback.
 * @param props.onCancel Cancellation callback.
 * @param props.deck Initial deck data to populate form fields with (e.g., when updating an existing deck).
 * @returns The component.
 */
export function DeckForm({
    onSubmit,
    onCancel,
    deck,
}: {
    onSubmit: (data: ModifyDeckData) => void;
    onCancel: () => void;
    /**
     * Default data for some fields in the form (e.g., when editing an already existing deck that has a name).
     */
    deck?: Partial<ModifyDeckData>;
}) {
    const defaultValues: ModifyDeckData = { name: deck?.name ?? "" };
    const form = useForm<ModifyDeckData>({ ...formConfig, defaultValues });

    function onSubmitInternal(data: ModifyDeckData) {
        onSubmit(data);
    }

    return (
        <Form {...form}>
            <form
                className={"space-y-3"}
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmitInternal))}
            >
                <FormInput control={form.control} name="name" label="Name" />
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
