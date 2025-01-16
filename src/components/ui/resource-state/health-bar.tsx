import { Progress } from "@/components/ui/base/progress";
import { colorForHealth, nameForHealth, toHealthState } from "@/lib/progression";
import { cn } from "@/lib/utils";

export interface HealthBarProps {
    retrievability: number | null;
    className?: string;
    withText?: boolean;
}

/**
 *
 * @param retrievability Object's retrievability.
 * @param className Custom classes.
 * @param withText Whether to display the text equivalent of the health state shown by the health bar
 * (e.g., "Freshly watered, 100%").
 */
export function HealthBar({ retrievability, className, withText }: HealthBarProps) {
    const isSeed = retrievability === null;
    const retrievabilityPercent = isSeed ? null : Math.ceil(retrievability * 100);
    const state = toHealthState(retrievabilityPercent);
    const progress = retrievabilityPercent ?? 0;
    const frontColorClass = colorForHealth[state]; // No need to check whether the object has valid health because the progress bar is rendered as empty in that case, i.e., the front color is unused
    const backColorClass = `${isSeed ? "bg-muted" : frontColorClass}/40`;
    return (
        <div className={"space-y-2"}>
            <div className={cn("h-6 overflow-hidden rounded-full border-4 border-ring", className)}>
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
