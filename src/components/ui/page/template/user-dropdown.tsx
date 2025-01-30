import { SelectUser } from "@/server/data/services/user";
import { ProfileBadge } from "@/components/ui/page/template/profile-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/base/dropdown-menu";
import { Button } from "@/components/ui/base/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChartColumnIncreasing, CircleUser, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/ui/page/template/sign-out-button";

export interface UserDropdownProps {
    user: SelectUser;
    className?: string;
}

export function UserDropdown({ user, className }: UserDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} className={cn("h-auto w-32 rounded-none", className)}>
                    <ProfileBadge user={user} className={"px-6 py-3"} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={"w-52"}>
                <DropdownMenuLabel className={"px-4 py-2"}>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={"p-0"}>
                    <Button
                        variant={"ghost"}
                        className={"w-full justify-between px-4 py-2"}
                        asChild
                    >
                        <Link href={"/statistics"}>
                            Statistics
                            <ChartColumnIncreasing />
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className={"p-0"}>
                    <Button
                        variant={"ghost"}
                        className={"w-full justify-between px-4 py-2"}
                        asChild
                    >
                        <Link href={"/account"}>
                            Account
                            <CircleUser />
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className={"p-0"}>
                    <SignOutButton variant={"ghost"} className={"w-full justify-between px-4 py-2"}>
                        Sign out <LogOut />
                    </SignOutButton>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
