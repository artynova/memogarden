import { SignupForm } from "@/app/signup/components/signup-form";
import Link from "next/link";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { TitledCard } from "@/components/ui/titled-card";

export default function Page() {
    return (
        <ThemeProvider theme={"system"} doNotPersistTheme>
            <ContentWrapper variant={"compact"} className={"min-h-screen"}>
                <TitledCard
                    title={"Sign up"}
                    description={"Enter your credentials below to create an account."}
                >
                    <div className="space-y-3">
                        <SignupForm />
                        <div className="mt-4 text-center text-sm">
                            {"Already have an account? "}
                            <Link href="/signin" className="underline">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </TitledCard>
            </ContentWrapper>
        </ThemeProvider>
    );
}
