"use client";

import { Button } from "@/components/ui/base/button";
import { signinWithFacebook, signinWithGoogle, signup } from "@/server/actions/user";
import { Form } from "@/components/ui/base/form";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialsSignupData, CredentialsSignupSchema } from "@/lib/validation-schemas";
import { FormInput } from "@/components/ui/form/form-input";
import React from "react";
import { ignoreAsyncFnResult } from "@/lib/utils";
import { ChevronsRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const formConfig: UseFormProps<CredentialsSignupData> = {
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
        <div className={"space-y-3"}>
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
                        <ChevronsRight aria-label={"Sign up icon"} />
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
                <FcGoogle aria-label={"Continue with Google icon"} />
            </Button>
            <Button
                onClick={ignoreAsyncFnResult(signinWithFacebook)}
                variant="outline"
                className="w-full hover:bg-background/50"
            >
                Continue with Facebook
                <FaFacebook
                    aria-label={"Continue with Facebook icon"}
                    className={"text-[#1877F2]"}
                />
            </Button>
        </div>
    );
}
