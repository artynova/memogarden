import { HomeButton } from "@/components/ui/page/template/home-button";
import { cn } from "@/lib/utils";
import { SelectUser } from "@/server/data/services/user";
import { LimitedTextSpan } from "@/components/ui/limited-text-span";
import { UserDropdown } from "@/components/ui/page/template/user-dropdown";

export interface HeaderProps {
    title: string;
    user: SelectUser;
    hideHomeButton?: boolean;
    className?: string;
}

const MAX_TITLE_LENGTH = 30;
const MAX_TITLE_LENGTH_MOBILE = 12;

export function Header({ title, user, hideHomeButton, className }: HeaderProps) {
    return (
        <header className={cn("flex justify-between border-b bg-secondary shadow", className)}>
            {!hideHomeButton && <HomeButton />}
            <h1 className="flex shrink grow items-center justify-center text-xl font-bold text-secondary-foreground sm:text-2xl">
                <LimitedTextSpan
                    text={title}
                    maxLength={MAX_TITLE_LENGTH}
                    maxLengthMobile={MAX_TITLE_LENGTH_MOBILE}
                />
            </h1>
            <UserDropdown user={user} />
        </header>
    );
}
