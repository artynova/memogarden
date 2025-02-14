import { HealthBar } from "@/components/resource/bars/health-bar";

/**
 * Deck health bar with an "Average health:" label.
 *
 * @param props Component properties.
 * @param props.retrievability Deck's retrievability.
 * @param props.withBarText Whether to display the text equivalent of the health state shown by the health bar (e.g.,
 * "Freshly watered, 100%") below the bar. This option has no effect on the label above the bar.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function DeckHealthBarWithLabel({
    retrievability,
    className,
    withBarText,
}: {
    retrievability: number | null; // A deck's retrievability may be null if it does not have cards
    className?: string;
    withBarText?: boolean;
}) {
    return (
        <HealthBar
            retrievability={retrievability}
            className={className}
            label={"Average health:"}
            withText={withBarText}
        />
    );
}
