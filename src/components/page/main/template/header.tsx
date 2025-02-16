import { HomeButton } from "@/components/page/main/template/home-button";
import { SelectUser } from "@/server/data/services/user";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { UserDropdown } from "@/components/page/main/template/user-dropdown";
import { cn } from "@/lib/ui/generic";

const MAX_TITLE_LENGTH = 30;
const MAX_TITLE_LENGTH_MOBILE = 12;

/**
 * Page header.
 *
 * @param props Component properties.
 * @param props.title Page title.
 * @param props.user User data.
 * @param props.hideHomeButton Whether to hide the home button in the header, e.g., when rendering a header skeleton
 * for the home page (defaults to false).
 * @param props.className Custom classes.
 * @returns The component.
 */
export function Header({
    title,
    user,
    hideHomeButton,
    className,
}: {
    title: string;
    user: SelectUser;
    hideHomeButton?: boolean;
    className?: string;
}) {
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
