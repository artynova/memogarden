import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DeckForm } from "@/components/resource/deck-form";

describe(DeckForm, () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    test("should render empty input field when supplied no initial value", () => {
        render(<DeckForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        const input = screen.queryByRole("textbox", { name: /name/i });
        const form = input?.closest("form");

        expect(input).toBeInTheDocument();
        expect(form).toHaveFormValues({});
    });

    test("should render pre-filled input field when supplied an initial value", () => {
        const mockDeck = { name: "Test Deck" };

        render(<DeckForm deck={mockDeck} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        const input = screen.queryByRole("textbox", { name: /name/i });
        const form = input?.closest("form");

        expect(input).toBeInTheDocument();
        expect(form).toHaveFormValues({ name: mockDeck.name });
    });

    test("should call onSubmit with input data when save button is clicked", async () => {
        const target = { name: "My Deck" };

        render(<DeckForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        const input = screen.getByRole("textbox", { name: /name/i });
        fireEvent.change(input, {
            target: { value: target.name },
        });
        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledExactlyOnceWith(target);
            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    test("should call onCancel when cancel button is clicked", async () => {
        const nameText = "hello world";

        render(<DeckForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        const input = screen.getByRole("textbox", { name: /name/i });
        fireEvent.change(input, {
            target: { value: nameText },
        });
        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockOnCancel).toHaveBeenCalledOnce();
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    test("should report validation errors and avoid submitting erroneous data", async () => {
        render(<DeckForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
        const input = screen.getByRole("textbox", { name: /name/i });
        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            const error = screen.queryByText(/required/i);

            expect(error).toBeInTheDocument();
            expect(error).toHaveClass("text-destructive");
            expect(input).toHaveAttribute("aria-invalid", "true");
            expect(input).toHaveAttribute("aria-describedby", expect.stringContaining(error!.id));
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });
});
