import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

export interface MarkdownProseProps {
    children?: string; // The markdown that is to be rendered
    className?: string;
}

/**
 * Simple wrapper for rendering markdown prose content with Tailwind prose styling. Triggers scrolling when either
 * vertical or horizontal size is exceeded.
 *
 * @param children Markdown string to be rendered.
 * @param className Custom classes.
 */
export function MarkdownProse({ children, className }: MarkdownProseProps) {
    return (
        <Markdown className={cn("prose overflow-scroll text-base md:text-sm", className)}>
            {children}
        </Markdown>
    );
}
