import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { CardForm } from "@/components/resource/card-form";
import { MarkdownProse } from "@/components/markdown/markdown-prose";

vi.mock("@/components/markdown/markdown-prose");

const mockedMarkdownProse = vi.mocked(MarkdownProse);

describe(CardForm, () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    test("should render empty input fields when supplied no initial value", () => {
        render(<CardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} deckOptions={[]} />);
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
        expect(inputFront!.textContent).toEqual(""); // Using text content instead of form values because React Testing Library's form values checks do not work with the CodeMirror-based Markdown input. Input submission test will verify that the values are actually correctly tracked by the code and stored in memory
        expect(inputBack).toBeInTheDocument();
        expect(inputBack!.textContent).toEqual("");
    });

    test.each([
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
    ])(
        "should correctly render deck selection options when provided options data $deckOptions",
        ({ deckOptions }) => {
            render(
                <CardForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    deckOptions={deckOptions}
                />,
            );
            const inputDeck = screen.getByRole("combobox");
            fireEvent.click(inputDeck);
            const options = screen.getAllByRole("option");

            options.forEach((option, index) => {
                expect(option).toHaveTextContent(deckOptions[index].label);
            });
        },
    );

    test.each([
        {
            front: "Hallo",
            back: "Hello",
            deckIndex: 0,
            deckOptions: [
                { label: "Deck 1", value: "test1" },
                { label: "Deck 2", value: "test2" },
            ],
        },
        {
            front: "2 + 2",
            back: "5",
            deckIndex: 1,
            deckOptions: [
                { label: "Deck 1", value: "test1" },
                { label: "Deck 2", value: "test2" },
            ],
        },
    ])(
        "should render pre-filled input fields when supplied initial values of front content $front, back content $back, and deck at index $deckIndex in options list $deckOptions",
        ({ front, back, deckIndex, deckOptions }) => {
            const card = { front, back, deckId: deckOptions[deckIndex].value };

            render(
                <CardForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    card={card}
                    deckOptions={deckOptions}
                />,
            );
            const inputDeck = screen.queryByRole("combobox", { name: /deck/i });
            const inputFront = screen
                .queryByText(/front/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];
            const inputBack = screen
                .queryByText(/back/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

            expect(inputDeck).toBeInTheDocument();
            expect(inputDeck).toHaveTextContent(deckOptions[deckIndex].label);
            expect(inputFront).toBeInTheDocument();
            expect(inputFront).toHaveTextContent(card.front);
            expect(inputBack).toBeInTheDocument();
            expect(inputBack).toHaveTextContent(card.back);
        },
    );

    test.each([
        {
            front: "*Hallo*",
            back: "**Hello**",
        },
        {
            front: "2 \\* 2",
            back: "5",
        },
    ])(
        "should render Markdown field previews instead of editors after clicking on the 'Enable preview' button given raw front content $front and back content $back",
        ({ front, back }) => {
            const card = { front, back };

            render(
                <CardForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    card={card}
                    deckOptions={[]}
                />,
            );
            const enablePreviewButton = screen.getByRole("button", { name: /enable preview/i });
            fireEvent.click(enablePreviewButton);

            expect(mockedMarkdownProse).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ children: front }),
                {},
            );
            expect(mockedMarkdownProse).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ children: back }),
                {},
            );
        },
    );

    test.each([
        {
            front: "*Hallo*",
            back: "**Hello**",
        },
        {
            front: "2 \\* 2",
            back: "5",
        },
    ])(
        "should render editable fields after clicking the preview trigger button twice (first 'Enable preview' and then 'Disable preview') given raw front content $front and back content $back",
        ({ front, back }) => {
            const card = { front, back };

            render(
                <CardForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    card={card}
                    deckOptions={[]}
                />,
            );
            const enablePreviewButton = screen.getByRole("button", { name: /enable preview/i });
            fireEvent.click(enablePreviewButton);
            const disablePreviewButton = screen.getByRole("button", { name: /disable preview/i });
            fireEvent.click(disablePreviewButton);
            const inputFront = screen
                .queryByText(/front/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];
            const inputBack = screen
                .queryByText(/back/i)
                ?.nextElementSibling?.getElementsByClassName("cm-content")[0];

            expect(inputFront).toBeInTheDocument();
            expect(inputFront).toHaveTextContent(card.front);
            expect(inputBack).toBeInTheDocument();
            expect(inputBack).toHaveTextContent(card.back);
        },
    );

    test("should call onSubmit with input data when save button is clicked", async () => {
        const deckOptions = [
            { label: "Deck 1", value: "test1" },
            { label: "Deck 2", value: "test2" },
        ];
        const deckIndex = 0;
        const target = { front: "Hallo", back: "Hello", deckId: deckOptions[deckIndex].value };

        render(
            <CardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} deckOptions={deckOptions} />,
        );
        // Simulate choosing card deck ID
        const inputDeck = screen.getByRole("combobox");
        fireEvent.click(inputDeck);
        const targetOption = screen.getByRole("option", {
            name: deckOptions[deckIndex].label,
        });
        fireEvent.click(targetOption);
        // Simulate inputting front Markdown
        const inputFront = screen
            .getByText(/front/i)
            .nextElementSibling?.getElementsByClassName("cm-content")[0];
        await userEvent.click(inputFront!);
        await userEvent.keyboard(target.front);
        // Simulate inputting back Markdown
        const inputBack = screen
            .getByText(/back/i)
            .nextElementSibling?.getElementsByClassName("cm-content")[0];
        await userEvent.click(inputBack!);
        await userEvent.keyboard(target.back);
        // Save
        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledExactlyOnceWith(target);
            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    test("should call onCancel when cancel button is clicked", async () => {
        const frontText = "hello world";

        render(<CardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} deckOptions={[]} />);
        // Simulate inputting front Markdown
        const inputFront = screen
            .getByText(/front/i)
            .nextElementSibling?.getElementsByClassName("cm-content")[0];
        await userEvent.click(inputFront!);
        await userEvent.keyboard(frontText);
        // Cancel
        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockOnCancel).toHaveBeenCalledOnce();
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    test("should report validation errors and avoid submitting erroneous data", async () => {
        render(<CardForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} deckOptions={[]} />);
        const inputDeck = screen.getByRole("combobox");
        const editorFront = screen.getByText(/front/i).nextElementSibling;
        const editorBack = screen.getByText(/back/i).nextElementSibling;
        const saveButton = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
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
            expect(mockOnSubmit).not.toHaveBeenCalled();
            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });
});
