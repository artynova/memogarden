import { SigninForm } from "@/app/signin/signin-form";
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
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>Enter your credentials below to sign in</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <SigninForm />
                    <div className="mt-4 text-center text-sm">
                        {"Don't have an account? "}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
