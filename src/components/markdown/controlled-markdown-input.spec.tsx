import { ControlledMarkdownInput } from "@/components/markdown/controlled-markdown-input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

describe(ControlledMarkdownInput, () => {
    describe.each([{ id: "test_id" }, { id: "markdown" }, { id: "f1" }])(
        "given ID $id",
        ({ id }) => {
            test("should forward ID to CodeMirror editor container", () => {
                const { container } = render(<ControlledMarkdownInput id={id} />);
                const editor = container.firstElementChild;

                expect(editor).toHaveAttribute("id", id);
            });
        },
    );

    describe("given no value for 'disabled' prop", () => {
        test("should render editable field", () => {
            render(<ControlledMarkdownInput />);
            const textbox = screen.getByRole("textbox");

            expect(textbox).toHaveAttribute("contenteditable", "true");
        });
    });

    describe("given 'true' value for 'disabled' prop", () => {
        test("should render non-editable field", () => {
            render(<ControlledMarkdownInput disabled />);
            const textbox = screen.getByRole("textbox");

            expect(textbox).toHaveAttribute("contenteditable", "false");
        });
    });

    describe("given input is not focused", () => {
        test("should not have focus-specific classes", () => {
            const { container } = render(<ControlledMarkdownInput />);
            const root = container.firstElementChild;

            expect(root).not.toHaveClass("ring-ring");
        });

        describe("when input becomes focused via clicking", () => {
            test("should execute 'onFocus' callback", async () => {
                const mockOnFocus = vi.fn();

                render(<ControlledMarkdownInput onFocus={mockOnFocus} />);
                const textbox = screen.getByRole("textbox");
                await userEvent.click(textbox);

                expect(mockOnFocus).toHaveBeenCalledOnce();
            });
        });

        describe("when input becomes focused via keyboard navigation", () => {
            test("should execute 'onFocus' callback", async () => {
                const mockOnFocus = vi.fn();

                render(<ControlledMarkdownInput onFocus={mockOnFocus} />);
                await userEvent.tab();

                expect(mockOnFocus).toHaveBeenCalledOnce();
            });
        });
    });

    describe("given input is focused", () => {
        test("should have focus-specific classes", async () => {
            const { container } = render(<ControlledMarkdownInput />);
            const textbox = screen.getByRole("textbox");
            await userEvent.click(textbox);
            const root = container.firstElementChild;

            expect(root).toHaveClass("ring-ring");
        });

        describe("when input loses focus via clicking", () => {
            test("should execute 'onBlur' callback", async () => {
                const mockOnBlur = vi.fn();

                const { container } = render(<ControlledMarkdownInput onBlur={mockOnBlur} />);
                const textbox = screen.getByRole("textbox");
                await userEvent.click(textbox);
                const root = container.firstElementChild;
                await userEvent.click(root!);

                expect(mockOnBlur).toHaveBeenCalledOnce();
            });
        });
    });

    describe.each([
        { value: undefined },
        { value: "`Some code`" },
        { value: "# Lorem ipsum" },
        { value: "1. A" },
    ])("given initial value $value", ({ value }) => {
        if (value) {
            test("should render value", () => {
                render(<ControlledMarkdownInput value={value} />);
                const textbox = screen.getByRole("textbox");

                expect(textbox).toHaveTextContent(value);
            });
        } else {
            test("should not render any editor content", () => {
                render(<ControlledMarkdownInput />);
                const textbox = screen.getByRole("textbox");

                expect(textbox).toHaveTextContent("");
            });
        }

        describe.each([{ input: "`Some code`" }, { input: "# Top heading" }, { input: "1. A" }])(
            "when user types input $input",
            ({ input }) => {
                test(`should forward updated text ${input + (value ?? "")} to 'onChange' callback`, async () => {
                    const mockOnChange = vi.fn();
                    const expectedContent = input + (value ?? ""); // Caret is placed at the beginning of the text when focusing, so the new input will be typed to the left of the initial value

                    render(<ControlledMarkdownInput onChange={mockOnChange} value={value} />);
                    await userEvent.tab();
                    await userEvent.keyboard(input);

                    expect(mockOnChange).toHaveBeenLastCalledWith(expectedContent);
                });
            },
        );
    });
});
