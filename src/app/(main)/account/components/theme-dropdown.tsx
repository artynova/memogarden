// Strictly client component

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import { Moon, Sun, SunMoon } from "lucide-react";

import { Theme } from "@/lib/ui/theme";

/**
 * Mapping of themes to labels in the theme select dropdown.
 */
const themeToLabel = {
    light: (
        <>
            <span>Light</span>
            <Sun aria-label="Light theme icon" />
        </>
    ),
    dark: (
        <>
            <span>Dark</span>
            <Moon aria-label="Dark theme icon" />
        </>
    ),
    system: (
        <>
            <span>System</span>
            <SunMoon aria-label="System theme icon" />
        </>
    ),
};

/**
 * Dropdown color theme selector.
 *
 * Strictly client component, must be used within the client boundary.
 *
 * @param props Component properties.
 * @param props.theme Current theme.
 * @param props.onThemeChange Theme change callback.
 * @param props.id HTML ID for the trigger button.
 * @returns The component.
 */
export function ThemeDropdown({
    theme,
    onThemeChange,
    id,
}: {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    id?: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full" id={id} asChild>
                <Button variant="outline">
                    {themeToLabel[theme]}
                    <span className="sr-only">Select theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem
                    disabled={theme === "light"}
                    className="flex justify-between"
                    onClick={() => onThemeChange("light")}
                >
                    {themeToLabel["light"]}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={theme === "dark"}
                    className="flex justify-between"
                    onClick={() => onThemeChange("dark")}
                >
                    {themeToLabel["dark"]}
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={theme === "system"}
                    className="flex justify-between"
                    onClick={() => onThemeChange("system")}
                >
                    {themeToLabel["system"]}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
