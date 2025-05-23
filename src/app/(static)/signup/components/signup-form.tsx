"use client";

import { Button } from "@/components/shadcn/button";
import { signinWithFacebook, signinWithGoogle, signup } from "@/server/actions/user/actions";
import { Form } from "@/components/shadcn/form";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/form/form-input";
import React from "react";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { ChevronsRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { CredentialsSignupData, CredentialsSignupSchema } from "@/server/actions/user/schemas";
import { ResponseConflict } from "@/lib/responses";

const formConfig: UseFormProps<CredentialsSignupData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(CredentialsSignupSchema),
    defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
    },
};

/**
 * Sign-up form with three fields - email, password, and password confirmation.
 *
 * @returns The component.
 */
export function SignupForm() {
    const form = useForm<CredentialsSignupData>(formConfig);

    async function onSubmit(data: CredentialsSignupData) {
        const inferredTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await signup(data, inferredTimezone);
        if (response?.status === ResponseConflict.status) {
            form.setError("email", { message: "Already in use" });
        }
    }

    return (
        <div className="space-y-3">
            <Form {...form}>
                <form
                    onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmit))}
                    className="w-full space-y-3"
                >
                    <FormInput control={form.control} name="email" label="Email:" />
                    <FormInput
                        control={form.control}
                        name="password"
                        label="Password:"
                        type="password"
                    />
                    <FormInput
                        control={form.control}
                        name="confirmPassword"
                        label="Confirm password:"
                        type="password"
                    />
                    <Button type="submit" className="w-full">
                        Sign up
                        <ChevronsRight aria-label="Sign up icon" />
                    </Button>
                </form>
            </Form>
            <div className="flex w-full justify-center text-sm text-muted-foreground">or</div>
            <Button
                onClick={ignoreAsyncFnResult(signinWithGoogle)}
                variant="outline"
                className="w-full hover:bg-background/50"
            >
                Continue with Google
                <FcGoogle aria-label="Continue with Google icon" />
            </Button>
            <Button
                onClick={ignoreAsyncFnResult(signinWithFacebook)}
                variant="outline"
                className="w-full hover:bg-background/50"
            >
                Continue with Facebook
                <FaFacebook aria-label="Continue with Facebook icon" className="text-[#1877F2]" />
            </Button>
        </div>
    );
}
