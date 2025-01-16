import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { cn } from "@/lib/utils";

export interface DeckHealthBarProps {
    retrievability: number | null; // A deck's retrievability may be null if it does not have cards
    className?: string;
    withBarText?: boolean;
}

/**
 * Component that adds consistent extra content to deck health bars to make it clear that the bars represent an
 * aggregated average of individual cards' health states.
 *
 * @param retrievability Deck's retrievability.
 * @param className Custom classes (passed to the parent wrapper, not to the base HealthBar component).
 * @param withBarText Whether to display the text equivalent of the health state shown by the health bar
 * (e.g., "Freshly watered, 100%") in the base health bar component. This option has no effect on the text added by
 * this component.
 */
export function DeckHealthBar({ retrievability, className, withBarText }: DeckHealthBarProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className={"text-center"}>Average health:</div>
            <HealthBar
                retrievability={retrievability}
                className={className}
                withText={withBarText}
            />
        </div>
    );
}
