import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { getLocaleDateString } from "@/lib/utils";

export interface CardHealthBarProps {
    retrievability: number; // A single card's retrievability cannot be null
    due: Date;
    timezone: string;
    className?: string;
    withBarText?: boolean;
}

/**
 * Component that adds consistent extra content to card health bars (e.g., due date).
 *
 * @param retrievability Card retrievability.
 * @param due Next card revision date.
 * @param timezone User's timezone in IANA format (for correctly determining the calendar date corresponding to the due
 * timestamp).
 * @param className Custom classes (passed to the parent wrapper, not to the base HealthBar component).
 * @param withBarText Whether to display the text equivalent of the health state shown by the health bar
 * (e.g., "Freshly watered, 100%") in the base health bar component. This option has no effect on the text added by
 * this component.
 */
export function CardHealthBar({
    retrievability,
    due,
    timezone,
    className,
    withBarText,
}: CardHealthBarProps) {
    return (
        <HealthBar
            retrievability={retrievability}
            className={className}
            label={`Due: ${getLocaleDateString(due, timezone)}`}
            withText={withBarText}
        />
    );
}
