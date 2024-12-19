"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateDeckData, CreateDeckSchema } from "@/lib/validation-schemas";
import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/base/form";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import { createNewDeck } from "@/server/actions/deck";
import { useRouter } from "next/navigation";
import { HOME } from "@/lib/routes";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(CreateDeckSchema),
    defaultValues: {
        name: "",
    },
};

export interface NewDeckFormHandle {
    submit: () => void;
}

export type NewDeckFormProps = object;

const NewDeckForm = forwardRef<NewDeckFormHandle, NewDeckFormProps>(({}, ref) => {
    const form = useForm<CreateDeckData>(formConfig);
    const router = useRouter();

    async function onSubmit(data: CreateDeckData) {
        await createNewDeck(data);
        router.push(HOME);
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
NewDeckForm.displayName = "NewDeckForm";

export { NewDeckForm };
