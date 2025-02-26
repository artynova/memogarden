import React from "react";

import { cn } from "@/lib/ui/generic";
import { FooterAction, FooterActionData } from "@/components/page/main/template/footer-action";

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
            {actions.map((action, index) => (
                <FooterAction action={action} key={index} />
            ))}
        </footer>
    );
}
