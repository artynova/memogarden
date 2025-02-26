import { describe, expect, test } from "vitest";
import { RemainingCardsGrid } from "@/components/resource/remaining-cards-grid";
import { render, screen } from "@testing-library/react";
import { textUnimportantClass } from "@/lib/ui/tailwind";

describe.each([
    {
        remaining: {
            new: 5,
            learning: 1,
            review: 3,
        },
    },
])(RemainingCardsGrid, ({ remaining }) => {
    const conditionString = `for ${remaining.new} 'new' cards, ${remaining.learning} 'learning' cards, and ${remaining.review} 'review' cards`;

    test(`should correctly render 'seed' card count correctly ${conditionString}`, () => {
        render(<RemainingCardsGrid remaining={remaining} />);
        const newLabel = screen.queryByText(/seeds/i);
        const count = newLabel?.nextSibling;

        expect(newLabel).toBeInTheDocument();
        expect(count).toHaveTextContent(`${remaining.new}`);
        if (remaining.new === 0) expect(count).toHaveClass(textUnimportantClass);
        else expect(count).not.toHaveClass(textUnimportantClass);
    });

    test(`should correctly render 'sprout' card count ${conditionString}`, () => {
        render(<RemainingCardsGrid remaining={remaining} />);
        const newLabel = screen.queryByText(/sprouts/i);
        const count = newLabel?.nextSibling;

        expect(newLabel).toBeInTheDocument();
        expect(count).toHaveTextContent(`${remaining.learning}`);
        if (remaining.learning === 0) expect(count).toHaveClass(textUnimportantClass);
        else expect(count).not.toHaveClass(textUnimportantClass);
    });

    test(`should correctly render 'growing' card count ${conditionString}`, () => {
        render(<RemainingCardsGrid remaining={remaining} />);
        const newLabel = screen.queryByText(/growing/i);
        const count = newLabel?.nextSibling;

        expect(newLabel).toBeInTheDocument();
        expect(count).toHaveTextContent(`${remaining.review}`);
        if (remaining.review === 0) expect(count).toHaveClass(textUnimportantClass);
        else expect(count).not.toHaveClass(textUnimportantClass);
    });
});
