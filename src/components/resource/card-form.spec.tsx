import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { CardForm } from "@/components/resource/card-form";
import { MarkdownProse } from "@/components/markdown/markdown-prose";
import { ModifyCardData } from "@/server/actions/card/schemas";

vi.mock("@/components/markdown/markdown-prose");

const mockedMarkdownProse = vi.mocked(MarkdownProse);

/**
 * Simulates a real user inputting given data into a form currently rendered on the screen.
 *
 * @param data Desired input data with .
 * @param deckLabel Label to find the target deck option by.
 */
async function inputIntoForm(data: ModifyCardData, deckLabel: string) {
    // Simulate choosing card deck ID
    const inputDeck = screen.getByRole("combobox");
    fireEvent.click(inputDeck);
    const targetOption = screen.getByRole("option", {
        name: deckLabel,
    });
    fireEvent.click(targetOption);
    // Simulate inputting front Markdown
    const inputFront = screen
        .getByText(/front/i)
        .nextElementSibling?.getElementsByClassName("cm-content")[0];
    await userEvent.click(inputFront!);
    await userEvent.keyboard(data.front);
    // Simulate inputting back Markdown
    const inputBack = screen
        .getByText(/back/i)
        .nextElementSibling?.getElementsByClassName("cm-content")[0];
    await userEvent.click(inputBack!);
    await userEvent.keyboard(data.back);
}

describe(CardForm, () => {
    describe("given no form input", () => {
        test("should render empty input fields", () => {
            render(<CardForm onSubmit={() => {}} onCancel={() => {}} deckOptions={[]} />);
            const inputDeck = screen.queryByRole("combobox", { name: /deck/i });
            const inputFront = screen
                .queryByText(/front/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];
            const inputBack = screen
                .queryByText(/back/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

            expect(inputDeck).toBeInTheDocument();
            expect(inputDeck).toHaveTextContent(/select a deck/i);
            expect(inputFront).toBeInTheDocument();
            expect(inputFront!.textContent).toEqual(""); // Using text content instead of form values because React Testing Library's form values checks do not work with the CodeMirror-based Markdown input. Input submission test will verify that the values are actually correctly tracked by the code
            expect(inputBack).toBeInTheDocument();
            expect(inputBack!.textContent).toEqual("");
        });

        describe("when save button is clicked", () => {
            test("should report missing values", async () => {
                render(<CardForm onSubmit={() => {}} onCancel={() => {}} deckOptions={[]} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);
                const inputDeck = screen.getByRole("combobox");
                const editorFront = screen.getByText(/front/i).nextElementSibling;
                const editorBack = screen.getByText(/back/i).nextElementSibling;
                const fieldsInOrder = [inputDeck, editorFront, editorBack];
                const errors = screen.getAllByText(/required/i);

                expect(errors.length).toEqual(3);
                errors.forEach((error, index) => {
                    expect(error).toHaveClass("text-destructive");
                    expect(fieldsInOrder[index]).toHaveAttribute("aria-invalid", "true");
                    expect(fieldsInOrder[index]).toHaveAttribute(
                        "aria-describedby",
                        expect.stringContaining(error.id),
                    );
                });
            });

            test("should not call 'onSubmit' callback", async () => {
                const mockOnSubmit = vi.fn();

                render(<CardForm onSubmit={mockOnSubmit} onCancel={() => {}} deckOptions={[]} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);

                expect(mockOnSubmit).not.toHaveBeenCalled();
            });

            test("should not call 'onCancel' callback", async () => {
                const mockOnCancel = vi.fn();

                render(<CardForm onSubmit={() => {}} onCancel={mockOnCancel} deckOptions={[]} />);
                const button = screen.getByRole("button", { name: /save/i });
                await userEvent.click(button);

                expect(mockOnCancel).not.toHaveBeenCalled();
            });
        });

        describe.each([
            {
                deckOptions: [
                    { label: "Deck 1", value: "test1" },
                    { label: "Deck 2", value: "test2" },
                    { label: "Deck 3", value: "test3" },
                ],
            },
            {
                deckOptions: [
                    { label: "Japanese", value: "uuid1" },
                    { label: "Polish", value: "uuid2" },
                    { label: "German", value: "uuid3" },
                ],
            },
        ])("given deck options $deckOptions", ({ deckOptions }) => {
            describe("given dropdown is expanded", () => {
                describe.each(deckOptions.map((option) => ({ option })))(
                    "for option $option",
                    ({ option }) => {
                        test("should render option in dropdown", () => {
                            render(
                                <CardForm
                                    onSubmit={() => {}}
                                    onCancel={() => {}}
                                    deckOptions={deckOptions}
                                />,
                            );
                            const inputDeck = screen.getByRole("combobox");
                            fireEvent.click(inputDeck);
                            const optionElement = screen.getByRole("option", {
                                name: option.label,
                            });

                            expect(optionElement).toBeInTheDocument();
                        });
                    },
                );
            });

            const validDataCases = [
                {
                    data: {
                        front: "H__a__llo",
                        back: "Hello",
                        deckId: deckOptions[0].value,
                    },
                    optionIndex: 0,
                },
                {
                    data: { front: "2 *+* 2", back: "~~4~~ 5", deckId: deckOptions[1].value },
                    optionIndex: 1,
                },
            ];

            describe.each(validDataCases)(
                "given initial card data $data",
                ({ data, optionIndex }) => {
                    test(`should render deck dropdown trigger with selected deck label ${deckOptions[optionIndex].label}`, () => {
                        render(
                            <CardForm
                                onSubmit={() => {}}
                                onCancel={() => {}}
                                card={data}
                                deckOptions={deckOptions}
                            />,
                        );
                        const inputDeck = screen.queryByRole("combobox", { name: /deck/i });

                        expect(inputDeck).toBeInTheDocument();
                        expect(inputDeck).toHaveTextContent(deckOptions[optionIndex].label);
                    });

                    describe("given preview mode is disabled", () => {
                        test(`should render front input with content ${data.front}`, () => {
                            render(
                                <CardForm
                                    onSubmit={() => {}}
                                    onCancel={() => {}}
                                    card={data}
                                    deckOptions={deckOptions}
                                />,
                            );
                            const inputFront = screen
                                .queryByText(/front/i)
                                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

                            expect(inputFront).toBeInTheDocument();
                            expect(inputFront).toHaveTextContent(data.front);
                        });

                        test(`should render back input with content ${data.back}`, () => {
                            render(
                                <CardForm
                                    onSubmit={() => {}}
                                    onCancel={() => {}}
                                    card={data}
                                    deckOptions={deckOptions}
                                />,
                            );
                            const inputBack = screen
                                .queryByText(/back/i)
                                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

                            expect(inputBack).toBeInTheDocument();
                            expect(inputBack).toHaveTextContent(data.back);
                        });

                        describe("when preview mode toggle button is clicked", () => {
                            test(`should forward front content ${data.front} to front 'MarkdownProse'`, () => {
                                render(
                                    <CardForm
                                        onSubmit={() => {}}
                                        onCancel={() => {}}
                                        card={data}
                                        deckOptions={[]}
                                    />,
                                );
                                const enablePreviewButton = screen.getByRole("button", {
                                    name: /enable preview/i,
                                });
                                fireEvent.click(enablePreviewButton);

                                expect(mockedMarkdownProse).toHaveBeenCalledTimes(2);
                                expect(mockedMarkdownProse).toHaveBeenNthCalledWithProps(1, {
                                    children: data.front,
                                });
                            });

                            test(`should forward back content ${data.back} to back 'MarkdownProse'`, () => {
                                render(
                                    <CardForm
                                        onSubmit={() => {}}
                                        onCancel={() => {}}
                                        card={data}
                                        deckOptions={[]}
                                    />,
                                );
                                const enablePreviewButton = screen.getByRole("button", {
                                    name: /enable preview/i,
                                });
                                fireEvent.click(enablePreviewButton);

                                expect(mockedMarkdownProse).toHaveBeenCalledTimes(2);
                                expect(mockedMarkdownProse).toHaveBeenNthCalledWithProps(2, {
                                    children: data.back,
                                });
                            });
                        });
                    });

                    describe("given preview mode is enabled", () => {
                        describe("when preview mode toggle button is clicked", () => {
                            test(`should render front input with content ${data.front}`, async () => {
                                render(
                                    <CardForm
                                        onSubmit={() => {}}
                                        onCancel={() => {}}
                                        card={data}
                                        deckOptions={deckOptions}
                                    />,
                                );
                                const enablePreviewButton = screen.getByRole("button", {
                                    name: /enable preview/i,
                                });
                                await userEvent.click(enablePreviewButton);
                                const disablePreviewButton = screen.getByRole("button", {
                                    name: /disable preview/i,
                                });
                                await userEvent.click(disablePreviewButton);
                                const inputFront = screen
                                    .queryByText(/front/i)
                                    ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

                                expect(inputFront).toBeInTheDocument();
                                expect(inputFront).toHaveTextContent(data.front);
                            });

                            test(`should render back input with content ${data.back}`, async () => {
                                render(
                                    <CardForm
                                        onSubmit={() => {}}
                                        onCancel={() => {}}
                                        card={data}
                                        deckOptions={deckOptions}
                                    />,
                                );
                                const enablePreviewButton = screen.getByRole("button", {
                                    name: /enable preview/i,
                                });
                                await userEvent.click(enablePreviewButton);
                                const disablePreviewButton = screen.getByRole("button", {
                                    name: /disable preview/i,
                                });
                                await userEvent.click(disablePreviewButton);
                                const inputBack = screen
                                    .queryByText(/back/i)
                                    ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

                                expect(inputBack).toBeInTheDocument();
                                expect(inputBack).toHaveTextContent(data.back);
                            });
                        });
                    });
                },
            );

            // Same data (valid form content) but with different meaning (active user input instead of initial data), requiring a distinct condition label
            describe.each(validDataCases)(
                "given valid form input $data",
                ({ data, optionIndex }) => {
                    describe("when save button is clicked", () => {
                        test("should call 'onSubmit' callback with new data", async () => {
                            const mockOnSubmit = vi.fn();

                            render(
                                <CardForm
                                    onSubmit={mockOnSubmit}
                                    onCancel={() => {}}
                                    deckOptions={deckOptions}
                                />,
                            );
                            await inputIntoForm(data, deckOptions[optionIndex].label);
                            const button = screen.getByRole("button", { name: /save/i });
                            await userEvent.click(button);

                            expect(mockOnSubmit).toHaveBeenCalledExactlyOnceWith(data);
                        });

                        test("should not call 'onCancel' callback", async () => {
                            const mockOnCancel = vi.fn();

                            render(
                                <CardForm
                                    onSubmit={() => {}}
                                    onCancel={mockOnCancel}
                                    deckOptions={deckOptions}
                                />,
                            );
                            await inputIntoForm(data, deckOptions[optionIndex].label);
                            const button = screen.getByRole("button", { name: /save/i });
                            await userEvent.click(button);

                            expect(mockOnCancel).not.toHaveBeenCalled();
                        });
                    });

                    describe("when cancel button is clicked", () => {
                        test("should not call 'onSubmit' callback", async () => {
                            const mockOnSubmit = vi.fn();

                            render(
                                <CardForm
                                    onSubmit={mockOnSubmit}
                                    onCancel={() => {}}
                                    deckOptions={deckOptions}
                                />,
                            );
                            await inputIntoForm(data, deckOptions[optionIndex].label);
                            const button = screen.getByRole("button", { name: /cancel/i });
                            await userEvent.click(button);

                            expect(mockOnSubmit).not.toHaveBeenCalled();
                        });

                        test("should call 'onCancel' callback", async () => {
                            const mockOnCancel = vi.fn();

                            render(
                                <CardForm
                                    onSubmit={() => {}}
                                    onCancel={mockOnCancel}
                                    deckOptions={deckOptions}
                                />,
                            );
                            await inputIntoForm(data, deckOptions[optionIndex].label);
                            const button = screen.getByRole("button", { name: /cancel/i });
                            await userEvent.click(button);

                            expect(mockOnCancel).toHaveBeenCalledOnce();
                        });
                    });
                },
            );
        });
    });
});
