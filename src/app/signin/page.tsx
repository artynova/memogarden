import { SigninForm } from "@/app/signin/components/signin-form";
import Link from "next/link";
import { ContentWrapper } from "@/components/ui/page/template/content-wrapper";
import { TitledCard } from "@/components/ui/titled-card";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function Page() {
    return (
        <ThemeProvider theme={"system"} doNotPersistTheme>
            <ContentWrapper variant={"compact"} className={"min-h-screen"}>
                <TitledCard
                    title={"Sign in"}
                    description={"Enter your credentials below to sign in."}
                >
                    <div className={"space-y-3"}>
                        <SigninForm />
                        <div className="mt-4 text-center text-sm">
                            {"Don't have an account? "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </TitledCard>
            </ContentWrapper>
        </ThemeProvider>
    );
}
