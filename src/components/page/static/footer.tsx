import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { Separator } from "@/components/shadcn/separator";
import { LandingLogo } from "@/components/landing-logo";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/ui/generic";

/**
 * Landing page footer with links.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function Footer({ className }: { className?: string }) {
    return (
        <footer
            className={cn(
                "flex w-full flex-col items-center border-t bg-secondary px-12 pt-12 shadow",
                className,
            )}
        >
            <div className="flex w-full flex-col items-center justify-center gap-x-12 border-y border-secondary-foreground py-3 sm:flex-row">
                <Button variant="link" className="text-secondary-foreground" asChild>
                    <Link href="/signin">Sign in</Link>
                </Button>
                <Separator
                    orientation="vertical"
                    className="hidden h-auto bg-secondary-foreground sm:block"
                />
                <LandingLogo />
                <Separator
                    orientation="vertical"
                    className="hidden h-auto bg-secondary-foreground sm:block"
                />
                <Button variant="link" className="text-secondary-foreground" asChild>
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
            <div className="flex w-full flex-col-reverse items-center gap-y-4 py-6 sm:flex-row sm:justify-between">
                <span className="text-xs">Created by Artem Novak, 2025</span>
                <Link href="https://github.com/artynova/memogarden">
                    <FaGithub aria-label="GitHub icon" />
                    <span className="sr-only">GitHub repository</span>
                </Link>
            </div>
        </footer>
    );
}
