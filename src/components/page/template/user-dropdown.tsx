import { SelectUser } from "@/server/data/services/user";
import { ProfileBadge } from "@/components/page/template/profile-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { ChartColumnIncreasing, CircleUser, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/page/template/sign-out-button";
import { cn } from "@/lib/ui/generic";

/**
 * User dropdown menu for the page header, using the profile badge as a button.
 *
 * @param props Component properties.
 * @param props.user User data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function UserDropdown({ user, className }: { user: SelectUser; className?: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "h-auto w-24 overflow-hidden rounded-none px-12 py-4 sm:w-32",
                        className,
                    )}
                >
                    <ProfileBadge user={user} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
                <DropdownMenuLabel className="px-4 py-2">Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                    <Button variant="ghost" className="w-full justify-between px-4 py-2" asChild>
                        <Link href="/statistics">
                            Statistics
                            <ChartColumnIncreasing />
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                    <Button variant="ghost" className="w-full justify-between px-4 py-2" asChild>
                        <Link href="/account">
                            Account
                            <CircleUser />
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                    <SignOutButton variant="ghost" className="w-full justify-between px-4 py-2">
                        Sign out <LogOut />
                    </SignOutButton>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
