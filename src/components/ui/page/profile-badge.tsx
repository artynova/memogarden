import { cn } from "@/lib/utils";
import { SelectUser } from "@/server/data/services/user";
import { HealthBar } from "@/components/ui/resource-state/health-bar";

export interface ProfileProps {
    user: SelectUser;
    className?: string;
}

export function ProfileBadge({ user, className }: ProfileProps) {
    return (
        <div className={cn("flex w-32 flex-col items-center space-y-2", className)}>
            <div className="size-16 rounded-full bg-black"></div>
            <HealthBar retrievability={user.retrievability} className="h-4 w-16" />
        </div>
    );
}
