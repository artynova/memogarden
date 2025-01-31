// Strictly client component, does not have the "use client" directive because a callback needs to be passed to it

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/base/dropdown-menu";
import { Button } from "@/components/ui/base/button";
import { Moon, Sun, SunMoon } from "lucide-react";
import { Theme } from "@/lib/ui";

export interface ThemeDropdownProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    id?: string;
}

const themeToLabel = {
    light: (
        <>
            <span>Light</span>
            <Sun aria-label={"Light theme icon"} />
        </>
    ),
    dark: (
        <>
            <span>Dark</span>
            <Moon aria-label={"Dark theme icon"} />
        </>
    ),
    system: (
        <>
            <span>System</span>
            <SunMoon aria-label={"System theme icon"} />
        </>
    ),
};

export function ThemeDropdown({ theme, onThemeChange, id }: ThemeDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={"w-full"} id={id} asChild>
                <Button variant="outline">
                    {themeToLabel[theme]}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={"w-[--radix-dropdown-menu-trigger-width]"}>
                <DropdownMenuItem
                    disabled={theme === "light"}
                    className={"flex justify-between"}
                    onClick={() => onThemeChange("light")}
                >
                    {themeToLabel["light"]}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={theme === "dark"}
                    className={"flex justify-between"}
                    onClick={() => onThemeChange("dark")}
                >
                    {themeToLabel["dark"]}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={theme === "system"}
                    className={"flex justify-between"}
                    onClick={() => onThemeChange("system")}
                >
                    {themeToLabel["system"]}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
