import { SigninForm } from "@/app/(static)/signin/components/signin-form";
import Link from "next/link";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { TitledCard } from "@/components/titled-card";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { InvalidTokenHandler } from "@/app/(static)/signin/components/invalid-token-handler";

/**
 * Static sign-in page.
 *
 * @returns The component.
 */
export default function Page() {
    return (
        <ThemeProvider theme="system" doNotPersistTheme>
            <InvalidTokenHandler />
            <main>
                <ContentWrapper variant="compact" className="min-h-screen">
                    <TitledCard
                        title="Sign in"
                        description="Enter your credentials below to sign in."
                    >
                        <div className="space-y-6">
                            <SigninForm />
                            <div className="mt-4 text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="underline">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </TitledCard>
                </ContentWrapper>
            </main>
        </ThemeProvider>
    );
}
