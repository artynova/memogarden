import React, { MouseEventHandler } from "react";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";

import { cn, GenericIconType } from "@/lib/ui/generic";

/**
 * Footer button action that is executed by navigating to a URL.
 */
export type LinkFooterAction = string;

/**
 * Footer button action that is executed by a custom handler.
 */
export type CustomFooterAction = MouseEventHandler<HTMLButtonElement>;

/**
 * Generic footer button action.
 */
export type FooterAction = LinkFooterAction | CustomFooterAction;

/**
 * Tests whether a given footer action object represents a link-based action.
 *
 * @param action Action to test.
 * @returns `true` if the action is a {@link LinkFooterAction}, `false` otherwise.
 */
export function isLinkAction(action: FooterAction): action is LinkFooterAction {
    return typeof action === "string";
}

/**
 * Tests whether a given footer action object represents an action with a custom handler.
 *
 * @param action Action to test.
 * @returns `true` if the action is a {@link CustomFooterAction}, `false` otherwise.
 */
export function isCustomAction(action: FooterAction): action is CustomFooterAction {
    return typeof action === "function";
}

/**
 * Data for rendering a single action button in the page footer section, including its icon, text, and the action
 * itself. If the action is a {@link LinkFooterAction}, the button will be implemented as a Next.js {@link Link}.
 * Otherwise, it will be a regular button.
 */
export interface FooterActionData {
    /**
     * An icon representing the action.
     */
    Icon: GenericIconType;
    /**
     * Action label (for screen readers only).
     */
    text: string;
    /**
     * Action to be executed.
     */
    action: LinkFooterAction | CustomFooterAction;
}

/**
 * Page footer with easily accessible, mobile-friendly action buttons. Will not render if an empty array of actions is
 * provided.
 *
 * @param props Component properties.
 * @param props.actions Footer action data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function Footer({
    actions,
    className,
}: {
    actions: FooterActionData[];
    className?: string;
}) {
    return (
        <footer
            className={cn(
                "flex flex-nowrap justify-center border-t bg-secondary shadow",
                className,
            )}
        >
            {actions.map(({ Icon, text, action }, index) => (
                <Button
                    size="icon"
                    className="h-28 w-auto grow rounded-none [&_svg]:size-14"
                    variant="ghost"
                    key={index}
                    asChild={isLinkAction(action)}
                    onClick={isCustomAction(action) ? action : undefined}
                >
                    {isLinkAction(action) ? (
                        <Link href={action}>
                            <Icon aria-label={`${text} icon`} />
                            <span className="sr-only">{text}</span>
                        </Link>
                    ) : (
                        <>
                            <Icon aria-label={`${text} icon`} />
                            <span className="sr-only">{text}</span>
                        </>
                    )}
                </Button>
            ))}
        </footer>
    );
}
