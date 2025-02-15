"use client";

import { Button } from "@/components/shadcn/button";
import {
    signinWithCredentials,
    signinWithFacebook,
    signinWithGoogle,
} from "@/server/actions/user/actions";
import { Form } from "@/components/shadcn/form";
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/form/form-input";
import { FieldsetWithErrorMessage } from "@/components/form/fieldset/fieldset-with-error-message";
import React, { useEffect, useState } from "react";
import { ResponseUnauthorized } from "@/lib/responses";
import { ignoreAsyncFnResult } from "@/lib/utils/generic";
import { ChevronsRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { CredentialsSigninData, CredentialsSigninSchema } from "@/server/actions/user/schemas";

const formConfig: UseFormProps<CredentialsSigninData> = {
    mode: "onBlur" as const,
    resolver: zodResolver(CredentialsSigninSchema),
    defaultValues: {
        email: "",
        password: "",
    },
};

/**
 * Sign-in form with two fields - email and password.
 *
 * @returns The component.
 */
export function SigninForm() {
    // Credentials mismatch error originating from the server
    const [rootServerError, setRootServerError] = useState("");
    const form = useForm<CredentialsSigninData>(formConfig);

    const formData = form.watch();

    // Remove credentials error as soon as the user edits any of the credentials
    useEffect(() => {
        setRootServerError("");
    }, [formData.email, formData.password]);

    async function onSubmit(data: CredentialsSigninData) {
        const response = await signinWithCredentials(data);
        if (response?.status === ResponseUnauthorized.status) {
            setRootServerError("Incorrect email or password");
        }
    }

    return (
        <div className="space-y-3">
            <Form {...form}>
                <form
                    onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmit))}
                    className="w-full space-y-3"
                >
                    <FieldsetWithErrorMessage name="credentials" error={rootServerError}>
                        <FormInput control={form.control} name="email" label="Email:" />
                        <FormInput
                            control={form.control}
                            name="password"
                            label="Password:"
                            type="password"
                        />
                    </FieldsetWithErrorMessage>
                    <Button type="submit" className="w-full">
                        Sign in
                        <ChevronsRight aria-label="Sign in icon" />
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
