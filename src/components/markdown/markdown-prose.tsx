import Markdown from "react-markdown";

import { cn } from "@/lib/ui/generic";

/**
 * Markdown prose block with default Tailwind prose styling. Triggers scrolling when either vertical or horizontal size
 * is exceeded.
 *
 * @param props Component properties.
 * @param props.children Markdown content to be rendered.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function MarkdownProse({ children, className }: { className?: string; children: string }) {
    return (
        <Markdown
            className={cn("prose overflow-auto text-base dark:prose-invert md:text-sm", className)}
        >
            {children}
        </Markdown>
    );
}
