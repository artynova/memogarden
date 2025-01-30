import { cn } from "@/lib/utils";
import { SelectUser } from "@/server/data/services/user";
import { HealthBar } from "@/components/ui/resource-state/health-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/base/avatar";
import { AvatarSkeleton } from "@/components/ui/page/skeleton/avatar-skeleton";

export interface ProfileProps {
    user: SelectUser;
    className?: string;
}

export function ProfileBadge({ user, className }: ProfileProps) {
    return (
        <div className={cn("flex w-32 flex-col items-center space-y-2", className)}>
            <Avatar className={"size-16 border-4 border-foreground"}>
                <AvatarImage src={`/avatars/${user.avatarId}.png`} />
                <AvatarFallback>
                    <AvatarSkeleton className={"size-16"} />
                </AvatarFallback>
            </Avatar>
            <HealthBar retrievability={user.retrievability} className="h-4 w-16" />
            <span className={"sr-only"}>Profile</span>
        </div>
    );
}
