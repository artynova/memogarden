import { HealthBar } from "@/components/resource/bars/health-bar";
import { getLocaleDateString } from "@/lib/utils/generic";

/**
 * Card health bar with a due date label.
 *
 * @param props Component properties.
 * @param props.retrievability Card retrievability.
 * @param props.due Next card review date.
 * @param props.timezone User's timezone in IANA format (for correctly determining the calendar date corresponding to
 * the due timestamp).
 * @param props.className Custom classes.
 * @param props.withBarText Whether to display the text equivalent of the health state shown by the health bar (e.g.,
 * "Freshly watered, 100%") below the bar. This option has no effect on the due date label above the bar.
 * @returns The component.
 */
export function CardHealthBarWithLabel({
    retrievability,
    due,
    timezone,
    withBarText,
    className,
}: {
    retrievability: number; // A single card's retrievability cannot be null
    due: Date;
    timezone: string;
    withBarText?: boolean;
    className?: string;
}) {
    return (
        <HealthBar
            retrievability={retrievability}
            className={className}
            label={`Due: ${getLocaleDateString(due, timezone)}`}
            withText={withBarText}
        />
    );
}
