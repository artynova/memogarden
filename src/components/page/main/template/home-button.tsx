import { Button } from "@/components/shadcn/button";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { HOME } from "@/lib/routes";

import { cn } from "@/lib/ui/generic";

/**
 * Home button in the page header.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function HomeButton({ className }: { className?: string }) {
    return (
        <Button
            variant="ghost"
            className={cn("h-auto w-24 rounded-none sm:w-32 [&_svg]:size-14", className)}
            asChild
        >
            <Link href={HOME}>
                <HomeIcon aria-label="Home icon" />
                <span className="sr-only">Home</span>
            </Link>
        </Button>
    );
}
