import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/base/progress";
import { getHealthProgress } from "@/lib/progression";
import { SelectUser } from "@/server/data/services/user";

export interface ProfileProps {
    user: SelectUser;
    className?: string;
}

export function ProfileBadge({ user, className }: ProfileProps) {
    const { progressRatio } = getHealthProgress(user.retrievability ?? 0);
    const progress = Math.round(progressRatio * 100);
    return (
        <div className={cn("flex w-32 flex-col items-center space-y-2", className)}>
            <div className="size-16 rounded-full bg-black"></div>
            <Progress value={progress} className="h-2.5 w-16 bg-primary/50" />
        </div>
    );
}
