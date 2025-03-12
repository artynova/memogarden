import { ThemeDropdown } from "@/app/(main)/account/components/theme-dropdown";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

describe(ThemeDropdown, () => {
    describe.each([{ id: "test_id" }, { id: "selector" }])("given component ID $id", ({ id }) => {
        test("should forward component ID to dropdown trigger", () => {
            const { container } = render(
                <ThemeDropdown theme="system" onThemeChange={() => {}} id={id} />,
            );
            const trigger = container.querySelector(`#${id}`);

            expect(trigger).toBeInTheDocument();
        });
    });

    describe.each([
        { theme: "light" as const },
        { theme: "dark" as const },
        { theme: "system" as const },
    ])("given theme $theme", ({ theme }) => {
        const themeRegex = new RegExp(theme, "i");

        test("should render current theme name inside dropdown trigger", () => {
            render(<ThemeDropdown theme={theme} onThemeChange={() => {}} />);
            const trigger = screen.queryByRole("button");

            expect(trigger).toBeInTheDocument();
            expect(trigger).toHaveTextContent(themeRegex);
        });

        describe("given dropdown is expanded", () => {
            test("should render current theme option as disabled in expanded dropdown", async () => {
                render(<ThemeDropdown theme={theme} onThemeChange={() => {}} />);
                const trigger = screen.getByRole("button");
                await userEvent.click(trigger);
                const item = screen
                    .getAllByRole("menuitem")
                    .filter((item) => themeRegex.test(item.textContent ?? ""))[0];

                expect(item).toBeInTheDocument();
                expect(item).toHaveAttribute("aria-disabled", "true");
                expect(item).toHaveAttribute("data-disabled");
            });

            test("should render other themes except the current as non-disabled in the expanded dropdown", async () => {
                render(<ThemeDropdown theme={theme} onThemeChange={() => {}} />);
                const trigger = screen.getByRole("button");
                await userEvent.click(trigger);
                const items = screen
                    .getAllByRole("menuitem")
                    .filter((item) => !themeRegex.test(item.textContent ?? ""));

                items.forEach((item) => {
                    expect(item).toBeInTheDocument();
                    expect(item).not.toHaveAttribute("aria-disabled");
                    expect(item).not.toHaveAttribute("data-disabled");
                });
            });
        });
    });
});
