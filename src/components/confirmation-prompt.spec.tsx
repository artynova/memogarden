import { describe, expect, test, vi } from "vitest";
import { ConfirmationPrompt } from "@/components/confirmation-prompt";
import { fireEvent, render, screen } from "@testing-library/react";

describe(ConfirmationPrompt, () => {
    test("should call the confirmation callback and not call the cancellation callback when confirmation button is clicked", () => {
        const mockOnConfirm = vi.fn();
        const mockOnCancel = vi.fn();

        render(<ConfirmationPrompt onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
        const confirmButton = screen.getByRole("button", { name: /confirm/i });
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledOnce();
        expect(mockOnCancel).not.toHaveBeenCalled();
    });

    test("should call the cancellation callback and not call the confirmation callback when cancellation button is clicked", () => {
        const mockOnConfirm = vi.fn();
        const mockOnCancel = vi.fn();

        render(<ConfirmationPrompt onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledOnce();
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });
});
