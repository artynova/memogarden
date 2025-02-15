import { Leaf } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/ui/generic";

/**
 * Link that leads to the app landing page (root route), containing the MemoGarden logo with icon and text.
 *
 * @param props Component properties.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function LandingLogo({ className }: { className?: string }) {
    return (
        <Link
            href="/public"
            className={cn("flex items-center justify-center gap-2 p-2", className)}
        >
            <Leaf aria-label="MemoGarden icon" className="size-4 shrink-0" />
            MemoGarden
        </Link>
    );
}
