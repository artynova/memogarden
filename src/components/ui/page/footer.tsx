import React, { MouseEventHandler } from "react";
import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LinkAction = string;

export type CustomAction = MouseEventHandler<HTMLButtonElement>;

export type FooterAction = LinkAction | CustomAction;

export function isLinkAction(action: FooterAction): action is LinkAction {
    return typeof action === "string";
}

export function isCustomAction(action: FooterAction): action is CustomAction {
    return typeof action === "function";
}

/**
 * Defines the required data for rendering a single hyperlink action button in the footer section, including its icon,
 * text, and the hyperlink itself.
 */
export interface FooterActionData {
    /**
     * A node (e.g., an icon from lucide-react) representing the icon.
     */
    Icon: React.ElementType;
    /**
     * Text label describing the button's action.
     */
    text: string;
    action: LinkAction | CustomAction;
}

export interface FooterProps {
    buttons: FooterActionData[];
    className?: string;
}

export function Footer({ buttons, className }: FooterProps) {
    return (
        <footer
            className={cn(
                "flex flex-nowrap justify-center border-t bg-secondary shadow",
                className,
            )}
        >
            {buttons.map(({ Icon, text, action }, index) => (
                <Button
                    size={"icon"}
                    className={"h-28 w-auto grow rounded-none [&_svg]:size-16"}
                    variant={"ghost"}
                    key={index}
                    asChild={isLinkAction(action)}
                    onClick={isCustomAction(action) ? action : undefined}
                >
                    {isLinkAction(action) ? (
                        <Link href={action}>
                            <Icon />
                            <span className={"sr-only"}>{text}</span>
                        </Link>
                    ) : (
                        <>
                            <Icon />
                            <span className={"sr-only"}>{text}</span>
                        </>
                    )}
                </Button>
            ))}
        </footer>
    );
}
