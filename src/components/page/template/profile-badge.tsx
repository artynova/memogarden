import { SelectUser } from "@/server/data/services/user";
import { HealthBar } from "@/components/resource/bars/health-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { AvatarSkeleton } from "@/components/page/skeleton/avatar-skeleton";
import { cn } from "@/lib/ui/generic";

/**
 * User profile badge with an avatar image and a health bar showing overall collection health.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function ProfileBadge({ user, className }: { user: SelectUser; className?: string }) {
    return (
        <div className={cn("flex w-full flex-col items-center space-y-2", className)}>
            <Avatar className="size-14 border-4 border-foreground">
                <AvatarImage src={`/avatars/${user.avatarId}.png`} alt="Avatar" />
                <AvatarFallback>
                    <AvatarSkeleton className="size-14" />
                </AvatarFallback>
            </Avatar>
            <HealthBar retrievability={user.retrievability} className="h-4 w-16" />
            <span className="sr-only">Profile</span>
        </div>
    );
}
