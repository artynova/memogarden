import { FooterAction } from "@/components/page/main/template/footer-action";
import { fireEvent, render, screen } from "@testing-library/react";
import { Check, Eye, Search, Trash } from "lucide-react";
import { describe, expect, test, vi } from "vitest";

describe(FooterAction, () => {
    describe.each([
        {
            action: {
                Icon: Eye,
                text: "Overview",
                action: "/overview",
            },
        },
        {
            action: {
                Icon: Search,
                text: "Search",
                action: "/browse",
            },
        },
        {
            action: {
                Icon: Check,
                text: "Confirm",
                action: vi.fn(), // To spy on handler calls
            },
        },
        {
            action: {
                Icon: Trash,
                text: "Delete",
                action: vi.fn(),
            },
        },
    ])("given action data $action", ({ action }) => {
        test(`should render element with inner text '${action.text}' specific to screen readers`, () => {
            render(<FooterAction action={action} />);
            const element = screen.queryByText(action.text);

            expect(element).toBeInTheDocument();
        });

        if (typeof action.action === "string") {
            test(`should render link with href '${action.action}'`, () => {
                render(<FooterAction action={action} />);
                const link = screen.queryByRole("link");

                expect(link).toBeInTheDocument();
                expect(link).toHaveTextContent(action.text); // The text is only visible to screen readers, but it should be in the DOM
                expect(link).toHaveAttribute("href", action.action);
            });
        } else {
            test("should render button with action as click handler", () => {
                render(<FooterAction action={action} />);
                const button = screen.queryByRole("button");
                if (button) fireEvent.click(button);

                expect(button).toBeInTheDocument();
                expect(action.action).toHaveBeenCalledOnce();
            });
        }
    });
});
