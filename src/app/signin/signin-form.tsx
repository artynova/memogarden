"use client";

import { Button } from "@/components/ui/base/button";
import { signinWithCredentials, signinWithFacebook, signinWithGoogle } from "@/server/actions/auth";
import { Form } from "@/components/ui/base/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialsSigninData, CredentialsSigninSchema } from "@/lib/validation-schemas";
import { InputWithLabel } from "@/components/ui/form/input-with-label";
import { FieldsetWithErrorMessage } from "@/components/ui/form/fieldset/fieldset-with-error-message";
import React, { useEffect, useState } from "react";
import { ResponseUnauthorized } from "@/lib/responses";
import { ignoreAsyncFnResult } from "@/lib/utils";

const formConfig = {
    mode: "onBlur" as const,
    resolver: zodResolver(CredentialsSigninSchema),
    defaultValues: {
        email: "",
        password: "",
    },
};

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
        <div className="space-y-2">
            <Form {...form}>
                <form
                    onSubmit={ignoreAsyncFnResult(form.handleSubmit(onSubmit))}
                    className="w-full space-y-2"
                >
                    <FieldsetWithErrorMessage name="credentials" error={rootServerError}>
                        <InputWithLabel control={form.control} name="email" label="Email:" />
                        <InputWithLabel
                            control={form.control}
                            name="password"
                            label="Password:"
                            type="password"
                        />
                    </FieldsetWithErrorMessage>
                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                </form>
            </Form>
            <div className="flex w-full justify-center text-sm text-muted-foreground">or</div>
            <Button
                onClick={ignoreAsyncFnResult(() => signinWithGoogle())}
                variant="outline"
                className="w-full"
            >
                Sign in with Google
            </Button>
            <Button
                onClick={ignoreAsyncFnResult(() => signinWithFacebook())}
                variant="outline"
                className="w-full"
            >
                Sign in with Facebook
            </Button>
        </div>
    );
}
