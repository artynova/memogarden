"use client";

import { Button } from "@/components/ui/base/button";
import { signup } from "@/server/actions/auth";
import { Form } from "@/components/ui/base/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialsSignupData, CredentialsSignupSchema } from "@/lib/validation-schemas";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import React from "react";
import { ignoreAsyncFnResult } from "@/lib/utils";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(CredentialsSignupSchema),
    defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
    },
};

export function SignupForm() {
    const form = useForm<CredentialsSignupData>(formConfig);

    async function onSubmit(data: CredentialsSignupData) {
        const inferredTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await signup(data, inferredTimezone);
        if (response?.status === 409) {
            form.setError("email", { message: "Already in use" });
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmit))}
                className="w-full space-y-2"
            >
                <InputWithLabel control={form.control} name="email" label="Email:" />
                <InputWithLabel
                    control={form.control}
                    name="password"
                    label="Password:"
                    type="password"
                />
                <InputWithLabel
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm password:"
                    type="password"
                />
                <Button type="submit" className="w-full">
                    Sign up
                </Button>
            </form>
        </Form>
    );
}
