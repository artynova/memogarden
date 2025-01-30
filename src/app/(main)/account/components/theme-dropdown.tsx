// Strictly client component, does not have the "use client" directive because a callback needs to be passed to it

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/base/dropdown-menu";
import { Button } from "@/components/ui/base/button";
import { Moon, Sun } from "lucide-react";
import { Theme } from "@/lib/ui";

export interface ThemeDropdownProps {
    onThemeChange: (theme: Theme) => void;
}

export function ThemeDropdown({ onThemeChange }: ThemeDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onThemeChange("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
