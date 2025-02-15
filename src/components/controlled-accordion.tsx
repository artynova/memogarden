// Strictly client component

import { ReactNode } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/shadcn/accordion";

/**
 * Data required to render a single accordion item.
 */
export interface AccordionItem {
    /**
     * Item heading (always visible).
     */
    heading: ReactNode;
    /**
     * Item content (visible only when the item is expanded).
     */
    content: ReactNode;
}

/**
 * Accordion with externally managed state.
 *
 * Strictly client component, must be used within the client boundary.
 *
 * @param props Component properties.
 * @param props.items Accordion items.
 * @param props.currentIndex Index of the currently expanded item in the items array.
 * @param props.onCurrentIndexChange Callback for when an index change is initiated from inside the accordion (e.g., the
 * user clicks on a different item to expand it).
 * @param props.className Custom classes.
 * @returns The component.
 */
export function ControlledAccordion({
    items,
    currentIndex,
    onCurrentIndexChange,
    className,
}: {
    items: AccordionItem[];
    currentIndex: number;
    onCurrentIndexChange: (index: number) => void;
    className?: string;
}) {
    return (
        <Accordion
            type={"single"}
            value={`${currentIndex}`}
            onValueChange={(value) => onCurrentIndexChange(parseInt(value))}
            className={className}
        >
            {items.map((item, index) => (
                <AccordionItem key={index} value={`${index}`}>
                    <AccordionTrigger>{item.heading}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
