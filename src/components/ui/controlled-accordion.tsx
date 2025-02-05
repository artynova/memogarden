// Strictly client component

import { ReactNode } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/base/accordion";

export interface AccordionItem {
    heading: ReactNode;
    content: ReactNode;
}

export interface ControlledAccordionProps {
    items: AccordionItem[];
    currentIndex: number;
    onCurrentIndexChange: (index: number) => void;
    className?: string;
}

export function ControlledAccordion({
    items,
    currentIndex,
    onCurrentIndexChange,
    className,
}: ControlledAccordionProps) {
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
