import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { Separator } from "@/components/ui/base/separator";
import { HomeLogo } from "@/components/ui/home-logo";
import { FaGithub } from "react-icons/fa";

export function Footer() {
    return (
        <footer
            className={"-mt-14 flex flex-col items-center border-t bg-secondary px-12 pt-20 shadow"}
        >
            <div
                className={
                    "flex w-full flex-col items-center justify-center gap-x-12 border-y border-secondary-foreground py-3 sm:flex-row"
                }
            >
                <Button variant={"link"} className={"text-secondary-foreground"} asChild>
                    <Link href={"/signin"}>Sign in</Link>
                </Button>
                <Separator
                    orientation={"vertical"}
                    className={"hidden h-auto bg-secondary-foreground sm:block"}
                />
                <HomeLogo />
                <Separator
                    orientation={"vertical"}
                    className={"hidden h-auto bg-secondary-foreground sm:block"}
                />
                <Button variant={"link"} className={"text-secondary-foreground"} asChild>
                    <Link href={"/signup"}>Sign up</Link>
                </Button>
            </div>
            <div
                className={
                    "flex w-full flex-col-reverse items-center gap-y-4 py-6 sm:flex-row sm:justify-between"
                }
            >
                <span className={"text-xs"}>Created by Artem Novak 2025</span>
                <Link href={"https://github.com/artynova/memogarden"}>
                    <FaGithub aria-label={"GitHub icon"} />
                    <span className={"sr-only"}>GitHub repository</span>
                </Link>
            </div>
        </footer>
    );
}
