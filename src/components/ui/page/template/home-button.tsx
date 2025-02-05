import { Button } from "@/components/ui/base/button";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { HOME } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface HomeButtonProps {
    className?: string;
}

export function HomeButton({ className }: HomeButtonProps) {
    return (
        <Button
            variant={"ghost"}
            className={cn("h-auto w-24 rounded-none sm:w-32 [&_svg]:size-14", className)}
            asChild
        >
            <Link href={HOME}>
                <HomeIcon aria-label={"Home icon"} />
                <span className={"sr-only"}>Home</span>
            </Link>
        </Button>
    );
}
