"use client";

import { Button } from "@/components/ui/base/button";
import { signup } from "@/server/actions/auth";
import { Form } from "@/components/ui/base/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialsSignupData, CredentialsSignupSchema } from "@/lib/validation-schemas";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import React from "react";

export function SignupForm() {
    const form = useForm<CredentialsSignupData>({
        mode: "onBlur",
        resolver: zodResolver(CredentialsSignupSchema),
    });

    async function onSubmit(data: CredentialsSignupData) {
        const response = await signup(data);
        if (response?.status === 409) form.setError("email", { message: "Already in use" });
    }

    return (
        <Form {...form}>
            <form onSubmit={void form.handleSubmit(onSubmit)} className="w-full space-y-2">
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
