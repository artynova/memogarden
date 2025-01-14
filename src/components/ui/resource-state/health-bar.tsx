import { Progress } from "@/components/ui/base/progress";
import { colorForHealth, nameForHealth, toHealthState } from "@/lib/progression";
import { cn } from "@/lib/utils";

export interface HealthBarProps {
    retrievability: number | null;
    className?: string;
    withText?: boolean;
}

export function HealthBar({ retrievability, className, withText }: HealthBarProps) {
    const state = toHealthState(retrievability);
    const progress = Math.ceil(retrievability ?? 0);
    const isSeed = retrievability === null;
    const frontColorClass = colorForHealth[state]; // No need to check whether the card is a seed for this color because the progress bar is rendered as empty in that case, i.e., the front color is unused
    const backColorClass = `${isSeed ? "bg-muted" : frontColorClass}/40`;
    return (
        <div className={"space-y-2"}>
            <div className={cn("overflow-hidden rounded-full border-4 border-ring", className)}>
                <Progress
                    value={progress}
                    className={cn("h-4", backColorClass, `[&>div]:${frontColorClass}`)}
                />
            </div>
            {withText && (
                <div className={"flex justify-center"}>
                    <span>{`${nameForHealth[state]}${isSeed ? "" : ", " + progress + "%"}`}</span>
                </div>
            )}
        </div>
    );
}
