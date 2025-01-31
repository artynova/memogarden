export const bgFineForegroundClass = "bg-fine-foreground";
export const bgWarningForegroundClass = "bg-warning-foreground";
export const bgProblemForegroundClass = "bg-problem-foreground";
export const bgUnimportantForegroundClass = "bg-muted-foreground";

export const bgFineClass = "bg-fine";
export const bgWarningClass = "bg-warning";
export const bgProblemClass = "bg-problem";
export const bgUnimportantClass = "bg-muted";

export interface SelectOption {
    value: string;
    label: string;
}

export type Theme = "dark" | "light" | "system";

export function darkModeToTheme(darkMode: boolean | null): Theme {
    return darkMode === null ? "system" : darkMode ? "dark" : "light";
}
