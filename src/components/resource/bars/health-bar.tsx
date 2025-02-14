import { Progress } from "@/components/shadcn/progress";
import { bgForegroundForHealth, bgForHealth, nameForHealth, toHealthState } from "@/lib/ui/health";

import { cn } from "@/lib/ui/generic";

/**
 * Health bar based on the SRS value of retrievability.
 *
 * @param props Component properties.
 * @param props.retrievability Object's retrievability.
 * @param props.label Optional label above the health bar.
 * @param props.withText Whether to display the text equivalent of the health state shown by the health bar (e.g.,
 * "Freshly watered, 100%") below the bar.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function HealthBar({
    retrievability,
    className,
    label,
    withText,
}: {
    retrievability: number | null;
    className?: string;
    label?: string;
    withText?: boolean;
}) {
    const retrievabilityMissing = retrievability === null;
    const retrievabilityPercent = retrievabilityMissing ? null : Math.ceil(retrievability * 100);
    const state = toHealthState(retrievabilityPercent);
    const progress = retrievabilityPercent ?? 0;
    const frontColorClass = bgForegroundForHealth[state]; // No need to check whether the object has valid health because the progress bar is rendered as empty in that case, i.e., the front color is unused
    const backColorClass = bgForHealth[state];
    return (
        <div className={"space-y-2"}>
            {label && <div className={"text-center"}>{label}</div>}
            <div
                className={cn(
                    "h-6 overflow-hidden rounded-full border-4 border-foreground",
                    className,
                )}
            >
                <Progress
                    value={progress}
                    className={cn("h-full", backColorClass, `[&>div]:${frontColorClass}`)}
                    aria-label={label ?? "Health bar"}
                />
            </div>
            {withText && (
                <div className={"flex justify-center"}>
                    <span>{`${nameForHealth[state]}, ${progress}%`}</span>
                </div>
            )}
        </div>
    );
}
