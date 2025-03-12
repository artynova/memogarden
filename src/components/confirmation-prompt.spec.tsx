import { describe, expect, test, vi } from "vitest";
import { ConfirmationPrompt } from "@/components/confirmation-prompt";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe(ConfirmationPrompt, () => {
    describe("when confirm button is clicked", () => {
        test("should call 'onConfirm' callback", async () => {
            const mockOnConfirm = vi.fn();

            render(<ConfirmationPrompt onConfirm={mockOnConfirm} onCancel={() => {}} />);
            const confirmButton = screen.getByRole("button", { name: /confirm/i });
            await userEvent.click(confirmButton);

            expect(mockOnConfirm).toHaveBeenCalledOnce();
        });

        test("should not call 'onConfirm' callback", async () => {
            const mockOnCancel = vi.fn();

            render(<ConfirmationPrompt onConfirm={() => {}} onCancel={mockOnCancel} />);
            const confirmButton = screen.getByRole("button", { name: /confirm/i });
            await userEvent.click(confirmButton);

            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    describe("when cancel button is clicked", () => {
        test("should not call 'onConfirm' callback", async () => {
            const mockOnConfirm = vi.fn();

            render(<ConfirmationPrompt onConfirm={mockOnConfirm} onCancel={() => {}} />);
            const confirmButton = screen.getByRole("button", { name: /cancel/i });
            await userEvent.click(confirmButton);

            expect(mockOnConfirm).not.toHaveBeenCalled();
        });

        test("should call 'onCancel' callback", async () => {
            const mockOnCancel = vi.fn();

            render(<ConfirmationPrompt onConfirm={() => {}} onCancel={mockOnCancel} />);
            const confirmButton = screen.getByRole("button", { name: /cancel/i });
            await userEvent.click(confirmButton);

            expect(mockOnCancel).toHaveBeenCalledOnce();
        });
    });
});
