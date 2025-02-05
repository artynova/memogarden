import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { HomeLogo } from "@/components/ui/home-logo";

export function Header() {
    return (
        <header
            className={
                "sticky top-0 z-20 flex items-center justify-between border-b bg-background p-3 px-6 shadow"
            }
        >
            <HomeLogo className={"h-full"} />
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
