import { ControlledMarkdownInput } from "@/components/markdown/controlled-markdown-input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

describe(ControlledMarkdownInput, () => {
    test.each([{ id: "test_id" }, { id: "markdown" }, { id: "f1" }])(
        "should forward provided HTML ID to the editor container given ID $id",
        ({ id }) => {
            const { container } = render(<ControlledMarkdownInput id={id} />);
            const editor = container.firstElementChild;

            expect(editor).toHaveAttribute("id", id);
        },
    );

    test("should render an editable input by default", () => {
        render(<ControlledMarkdownInput />);
        const textbox = screen.getByRole("textbox");

        expect(textbox).toHaveAttribute("contenteditable", "true");
    });

    test("should render a non-editable input when disabled", () => {
        render(<ControlledMarkdownInput disabled />);
        const textbox = screen.getByRole("textbox");

        expect(textbox).toHaveAttribute("contenteditable", "false");
    });

    test("should not have focus-specific classes initially", () => {
        const { container } = render(<ControlledMarkdownInput />);
        const root = container.firstElementChild;

        expect(root).not.toHaveClass("ring-ring");
    });

    test("should execute 'onFocus' callback correctly when focusing on the editor", async () => {
        const mockOnFocus = vi.fn();

        render(<ControlledMarkdownInput onFocus={mockOnFocus} />);
        const textbox = screen.getByRole("textbox");
        await userEvent.click(textbox);

        expect(mockOnFocus).toHaveBeenCalledOnce();
    });

    test("should have focus-specific classes when focused", async () => {
        const { container } = render(<ControlledMarkdownInput />);
        const textbox = screen.getByRole("textbox");
        await userEvent.click(textbox);
        const root = container.firstElementChild;

        expect(root).toHaveClass("ring-ring");
    });

    test("should execute 'onBlur' callback correctly when the editor loses focus", async () => {
        const mockOnBlur = vi.fn();

        const { container } = render(<ControlledMarkdownInput onBlur={mockOnBlur} />);
        const textbox = screen.getByRole("textbox");
        await userEvent.click(textbox);
        const root = container.firstElementChild;
        await userEvent.click(root!);

        expect(mockOnBlur).toHaveBeenCalledOnce();
    });

    test("should not have focus-specific classes after focusing and unfocusing", async () => {
        const { container } = render(<ControlledMarkdownInput />);
        const textbox = screen.getByRole("textbox");
        await userEvent.click(textbox);
        const root = container.firstElementChild;
        await userEvent.click(root!);

        expect(root).not.toHaveClass("ring-ring");
    });

    test.each([{ value: "Some code" }, { value: "Lorem ipsum" }, { value: "A" }])(
        "should render initial value $value when passed",
        ({ value }) => {
            render(<ControlledMarkdownInput value={value} />);
            const textContent = screen.queryByText(value);

            expect(textContent).toBeInTheDocument();
        },
    );

    test.each([{ target: "`Some code`" }, { target: "# Top heading" }, { target: "1. A" }])(
        "should forward input text to 'onChange' when user types $target",
        async ({ target }) => {
            const mockOnChange = vi.fn();

            render(<ControlledMarkdownInput onChange={mockOnChange} />);
            const textbox = screen.getByRole("textbox");
            await userEvent.click(textbox);
            await userEvent.keyboard(target);

            expect(mockOnChange).toHaveBeenLastCalledWith(target);
        },
    );
});
