import { ReactNode } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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

export interface ContentWrapperProps extends VariantProps<typeof wrapperVariants> {
    children: ReactNode;
    className?: string;
}

/**
 * Wrapper for the main content of the page, adding the necessary margins and padding on all sides.
 *
 * @param children Actual main content.
 * @param variant Wrapper variant.
 * @param className Custom classes.
 */
export function ContentWrapper({ children, variant, className }: ContentWrapperProps) {
    return <div className={cn(wrapperVariants({ variant, className }))}>{children}</div>;
}
