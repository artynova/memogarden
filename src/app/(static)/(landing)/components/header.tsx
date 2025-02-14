import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { LandingLogo } from "@/components/landing-logo";

/**
 * Sticky landing page header.
 *
 * @returns The component.
 */
export function Header() {
    return (
        <header
            className={
                "sticky top-0 z-20 flex items-center justify-between border-b bg-background p-3 px-6 shadow"
            }
        >
            <LandingLogo className={"h-full"} />
            <div className={"flex gap-3"}>
                <Button variant={"ghost"} asChild>
                    <Link href={"/signin"}>Sign in</Link>
                </Button>
                <Button variant={"outline"} asChild>
                    <Link href={"/signup"}>Sign up</Link>
                </Button>
            </div>
        </header>
    );
}
