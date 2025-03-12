import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DeckForm } from "@/components/resource/deck-form";
import { ModifyDeckData } from "@/server/actions/deck/schemas";
import userEvent from "@testing-library/user-event";

/**
 * Simulates a real user inputting given data into a form currently rendered on the screen.
 *
 * @param data Desired input data.
 */
function inputIntoForm(data: ModifyDeckData) {
    const input = screen.getByRole("textbox", { name: /name/i });
    fireEvent.change(input, {
        target: { value: data.name },
    });
}

describe(DeckForm, () => {
    describe("given no form input", () => {
        test("should render empty name input", () => {
            render(<DeckForm onSubmit={() => {}} onCancel={() => {}} />);
            const inputName = screen.queryByRole("textbox", { name: /name/i });
            const form = inputName?.closest("form");

            expect(inputName).toBeInTheDocument();
            expect(form).toHaveFormValues({});
        });

        describe("when save button is clicked", () => {
            test("should report missing value", async () => {
                render(<DeckForm onSubmit={() => {}} onCancel={() => {}} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);
                const inputName = screen.queryByRole("textbox", { name: /name/i });
                const error = screen.queryByText(/required/i);

                expect(error).toBeInTheDocument();
                expect(error).toHaveClass("text-destructive");
                expect(inputName).toHaveAttribute("aria-invalid", "true");
                expect(inputName).toHaveAttribute(
                    "aria-describedby",
                    expect.stringContaining(error!.id),
                );
            });

            test("should not call 'onSubmit' callback", async () => {
                const mockOnSubmit = vi.fn();

                render(<DeckForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);

                expect(mockOnSubmit).not.toHaveBeenCalled();
            });

            test("should not call 'onCancel' callback", async () => {
                const mockOnCancel = vi.fn();

                render(<DeckForm onSubmit={() => {}} onCancel={mockOnCancel} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);

                expect(mockOnCancel).not.toHaveBeenCalled();
            });
        });

        const validDataCases = [
            { data: { name: "Japanese" } },
            { data: { name: "Polish" } },
            { data: { name: "Lorem ipsum" } },
        ];

        describe.each(validDataCases)("given initial deck data $data", ({ data }) => {
            test(`should render name input with value ${data.name}`, () => {
                render(<DeckForm onSubmit={() => {}} onCancel={() => {}} deck={data} />);
                const inputName = screen.queryByRole("textbox", { name: /name/i });
                const form = inputName?.closest("form");

                expect(inputName).toBeInTheDocument();
                expect(form).toHaveFormValues({ name: data.name });
            });
        });

        // Same data (valid form content) but with different meaning (active user input instead of initial data), requiring a distinct condition label
        describe.each(validDataCases)("given valid form input $data", ({ data }) => {
            describe("when save button is clicked", () => {
                test("should call 'onSubmit' callback with new data", async () => {
                    const mockOnSubmit = vi.fn();

                    render(<DeckForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /save/i });
                    await userEvent.click(button);

                    expect(mockOnSubmit).toHaveBeenCalledExactlyOnceWith(data);
                });

                test("should not call 'onCancel' callback", async () => {
                    const mockOnCancel = vi.fn();

                    render(<DeckForm onSubmit={() => {}} onCancel={mockOnCancel} />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /save/i });
                    await userEvent.click(button);

                    expect(mockOnCancel).not.toHaveBeenCalled();
                });
            });

            describe("when cancel button is clicked", () => {
                test("should not call 'onSubmit' callback", async () => {
                    const mockOnSubmit = vi.fn();

                    render(<DeckForm onSubmit={mockOnSubmit} onCancel={() => {}} />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /cancel/i });
                    await userEvent.click(button);

                    expect(mockOnSubmit).not.toHaveBeenCalled();
                });

                test("should call 'onCancel' callback", async () => {
                    const mockOnCancel = vi.fn();

                    render(<DeckForm onSubmit={() => {}} onCancel={mockOnCancel} />);
                    inputIntoForm(data);
                    const button = screen.getByRole("button", { name: /cancel/i });
                    await userEvent.click(button);

                    expect(mockOnCancel).toHaveBeenCalledOnce();
                });
            });
        });
    });
});
