// Strictly client component

import { Button } from "@/components/shadcn/button";
import { changePassword } from "@/server/actions/user/actions";
import { Form } from "@/components/shadcn/form";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/form/form-input";
import React from "react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { ResponseUnauthorized } from "@/lib/responses";
import { Check, X } from "lucide-react";
import { ChangePasswordData, ChangePasswordSchema } from "@/server/actions/user/schemas";

const formConfig: UseFormProps<ChangePasswordData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
        oldPassword: "",
        password: "",
        confirmPassword: "",
    },
};

/**
 * Password change form.
 *
 * @param props Component properties.
 * @param props.onCancel Cancellation callback.
 * @returns The component.
 */
export function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
    const form = useForm<ChangePasswordData>(formConfig);

    async function onSubmit(data: ChangePasswordData) {
        const response = await changePassword(data);
        if (response?.status === ResponseUnauthorized.status)
            form.setError("oldPassword", { message: "Incorrect password" });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmit))}
                className="w-full space-y-2"
            >
                <FormInput
                    control={form.control}
                    name="oldPassword"
                    label="Current password:"
                    type="password"
                />
                <FormInput
                    control={form.control}
                    name="password"
                    label="New password:"
                    type="password"
                />
                <FormInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm new password:"
                    type="password"
                />
                <div className={"flex justify-center space-x-2"}>
                    <Button size={"lg"}>
                        <span>Confirm</span>
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
