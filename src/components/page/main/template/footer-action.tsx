import { Button } from "@/components/shadcn/button";
import { GenericIconType } from "@/lib/ui/generic";
import Link from "next/link";
import { MouseEventHandler } from "react";

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
export type GenericFooterAction = LinkFooterAction | CustomFooterAction;

/**
 * Tests whether a given footer action object represents a link-based action.
 *
 * @param action Action to test.
 * @returns `true` if the action is a {@link LinkFooterAction}, `false` otherwise.
 */
export function isLinkAction(action: GenericFooterAction): action is LinkFooterAction {
    return typeof action === "string";
}

/**
 * Tests whether a given footer action object represents an action with a custom handler.
 *
 * @param action Action to test.
 * @returns `true` if the action is a {@link CustomFooterAction}, `false` otherwise.
 */
export function isCustomAction(action: GenericFooterAction): action is CustomFooterAction {
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
 * Single action button in the application footer.
 *
 * @param props Component properties.
 * @param props.action Action data.
 * @returns The component.
 */
export function FooterAction({ action }: { action: FooterActionData }) {
    return (
        <Button
            size="icon"
            className="h-28 w-auto grow rounded-none [&_svg]:size-14"
            variant="ghost"
            asChild={isLinkAction(action.action)}
            onClick={isCustomAction(action.action) ? action.action : undefined}
        >
            {isLinkAction(action.action) ? (
                <Link href={action.action}>
                    <action.Icon aria-label={`${action.text} icon`} />
                    <span className="sr-only">{action.text}</span>
                </Link>
            ) : (
                <>
                    <action.Icon aria-label={`${action.text} icon`} />
                    <span className="sr-only">{action.text}</span>
                </>
            )}
        </Button>
    );
}
