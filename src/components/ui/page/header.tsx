import { HomeButton } from "@/components/ui/page/home-button";
import { ProfileBadge } from "@/components/ui/page/profile-badge";
import { cn } from "@/lib/utils";
import { SelectUser } from "@/server/data/services/user";

export interface HeaderProps {
    title: string;
    user: SelectUser;
    hideHomeButton?: boolean;
    className?: string;
}

export function Header({ title, user, hideHomeButton, className }: HeaderProps) {
    return (
        <header className={cn("flex justify-between border-b bg-secondary shadow", className)}>
            {!hideHomeButton && <HomeButton />}
            <div className={"flex grow-[5] items-center justify-between py-6"}>
                <h1 className="flex grow-[3] justify-center text-xl font-bold text-gray-800">
                    {title}
                </h1>
                <ProfileBadge user={user} className={"px-6"} />
            </div>
        </header>
    );
}
