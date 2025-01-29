import { Progress } from "@/components/ui/base/progress";
import { colorForHealth, nameForHealth, toHealthState } from "@/lib/progression";
import { cn } from "@/lib/utils";

export interface HealthBarProps {
    retrievability: number | null;
    className?: string;
    label?: string;
    withText?: boolean;
}

/**
 * Component for displaying an SRS retrievability value as a percent-based health bar.
 *
 * @param retrievability Object's retrievability.
 * @param className Custom classes.
 * @param label Optional label above the health bar.
 * @param withText Whether to display the text equivalent of the health state shown by the health bar
 * (e.g., "Freshly watered, 100%").
 */
export function HealthBar({ retrievability, className, label, withText }: HealthBarProps) {
    const isSeed = retrievability === null;
    const retrievabilityPercent = isSeed ? null : Math.ceil(retrievability * 100);
    const state = toHealthState(retrievabilityPercent);
    const progress = retrievabilityPercent ?? 0;
    const frontColorClass = colorForHealth[state]; // No need to check whether the object has valid health because the progress bar is rendered as empty in that case, i.e., the front color is unused
    const backColorClass = `${isSeed ? "bg-muted" : frontColorClass}/40`; // TODO make the color fully opaque
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
