import { SignupForm } from "@/app/signup/signup-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/base/card";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto w-96 max-w-96">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>
                        Enter your credentials below to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <SignupForm />
                    <div className="mt-4 text-center text-sm">
                        {"Already have an account? "}
                        <Link href="/signin" className="underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
