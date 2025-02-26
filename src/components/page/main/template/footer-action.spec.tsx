import { FooterAction } from "@/components/page/main/template/footer-action";
import { fireEvent, render, screen } from "@testing-library/react";
import { Check, Eye, Search, Trash } from "lucide-react";
import { describe, expect, test, vi } from "vitest";

describe(FooterAction, () => {
    test.each([
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
    ])("should render a link when passed link action data $action", ({ action }) => {
        render(<FooterAction action={action} />);
        const link = screen.queryByRole("link");

        expect(link).toBeInTheDocument();
        expect(link).toHaveTextContent(action.text); // The text is only visible to screen readers, but it should be in the DOM
        expect(link).toHaveAttribute("href", action.action);
    });

    test.each([
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
    ])(
        "should render a button with the correct click handler when passed custom action data $action",
        ({ action }) => {
            render(<FooterAction action={action} />);
            const button = screen.queryByRole("button");
            if (button) fireEvent.click(button);

            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent(action.text); // The text is only visible to screen readers, but it should be in the DOM
            expect(action.action).toHaveBeenCalledOnce();
        },
    );
});
