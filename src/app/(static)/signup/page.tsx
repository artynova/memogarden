import { SignupForm } from "@/app/(static)/signup/components/signup-form";
import Link from "next/link";
import { ContentWrapper } from "@/components/page/content-wrapper";
import { TitledCard } from "@/components/titled-card";
import { PageTemplate } from "@/components/page/static/page-template";

/**
 * Static sign-up page.
 *
 * @returns The component.
 */
export default function Page() {
    return (
        <PageTemplate>
            <ContentWrapper variant="compact">
                <TitledCard
                    title="Sign up"
                    description="Enter your credentials below to create an account."
                >
                    <div className="space-y-6">
                        <SignupForm />
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/signin" className="underline">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </TitledCard>
            </ContentWrapper>
        </PageTemplate>
    );
}
