"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDeckData, CreateDeckSchema } from "@/lib/validation-schemas";
import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/base/form";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import { useRouter } from "next/navigation";
import { SelectDeck } from "@/server/data/services/deck";
import { updateDeck } from "@/server/actions/deck";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(CreateDeckSchema),
};

export interface EditDeckFormHandle {
    submit: () => void;
}

export interface EditDeckFormProps {
    deck: SelectDeck;
}

const EditDeckForm = forwardRef<EditDeckFormHandle, EditDeckFormProps>(({ deck }, ref) => {
    const form = useForm<CreateDeckData>({ ...formConfig, defaultValues: { name: deck.name } });
    const router = useRouter();

    async function onSubmit(data: CreateDeckData) {
        await updateDeck(data, deck.id);
        router.push(`/deck/${deck.id}`);
    }

    useImperativeHandle(ref, () => ({
        submit: form.handleSubmit(onSubmit),
    }));

    return (
        <Form {...form}>
            <form className="">
                <InputWithLabel control={form.control} name="name" label="Name" />
            </form>
        </Form>
    );
});
EditDeckForm.displayName = "EditDeckForm";

export { EditDeckForm };
