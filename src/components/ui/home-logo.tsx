import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface LogoWithTextProps {
    className?: string;
}

export function HomeLogo({ className }: LogoWithTextProps) {
    return (
        <Link href={"/"} className={cn("flex items-center justify-center gap-2 p-2", className)}>
            <Leaf aria-label={"MemoGarden icon"} className={"size-4 shrink-0"} />
            MemoGarden
        </Link>
    );
}
