import { ReactNode } from "react";

import { cn } from "@/lib/ui/generic";

/**
 * Single landing page section.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @param props.children Content.
 * @returns The component.
 */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <section className={cn("flex w-full flex-col items-center gap-6", className)}>
            {children}
        </section>
    );
}
