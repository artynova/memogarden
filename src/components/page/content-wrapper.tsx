import { ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/ui/generic";

const wrapperVariants = cva("mx-auto flex flex-col gap-y-6 p-6", {
    variants: {
        variant: {
            // Generic variant for tall, scrollable pages
            default: "max-w-screen-lg",
            // Special variant for compact pages that don't need scrolling and benefit from vertically centered content (e.g., individual deck page)
            compact: "h-full max-w-screen-sm items-stretch justify-center",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

/**
 * Properties for a content wrapper.
 */
export interface ContentWrapperProps extends VariantProps<typeof wrapperVariants> {
    /**
     * Content.
     */
    children: ReactNode;
    /**
     * Custom classes.
     */
    className?: string;
}

/**
 * Wrapper for the main content of a page, adding the necessary margins and padding on all sides.
 *
 * @param props Component properties.
 * @param props.children Actual main content.
 * @param props.variant Wrapper variant.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function ContentWrapper({ children, variant, className }: ContentWrapperProps) {
    return <div className={cn(wrapperVariants({ variant, className }))}>{children}</div>;
}
