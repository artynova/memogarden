import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LandingSectionProps {
    children: ReactNode;
    className?: string;
}

export function Section({ children, className }: LandingSectionProps) {
    return (
        <section className={cn("flex w-full flex-col items-center gap-6", className)}>
            {children}
        </section>
    );
}
