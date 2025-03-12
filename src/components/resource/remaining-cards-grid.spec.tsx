import { describe, expect, test } from "vitest";
import { RemainingCardsGrid } from "@/components/resource/remaining-cards-grid";
import { render, screen } from "@testing-library/react";
import { textUnimportantClass } from "@/lib/ui/tailwind";

describe(RemainingCardsGrid, () => {
    // const conditionString = `for ${remaining.new} 'new' cards, ${remaining.learning} 'learning' cards, and ${remaining.review} 'review' cards`;

    describe.each([
        {
            remaining: {
                new: 0,
                learning: 0,
                review: 0,
            },
        },
        {
            remaining: {
                new: 0,
                learning: 3,
                review: 0,
            },
        },
        {
            remaining: {
                new: 0,
                learning: 2,
                review: 6,
            },
        },
        {
            remaining: {
                new: 5,
                learning: 1,
                review: 3,
            },
        },
    ])("given remaining cards data $remaining", ({ remaining }) => {
        test(`should render 'seed' card count as ${remaining.new}`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const label = screen.queryByText(/seeds/i);
            const count = label?.nextSibling;

            expect(label).toBeInTheDocument();
            expect(count).toHaveTextContent(`${remaining.new}`);
        });

        test(`${remaining.new ? "should not" : "should"} render 'seed' card count with unimportant text style`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const count = screen.getByText(/seeds/i).nextSibling;

            if (remaining.new) expect(count).not.toHaveClass(textUnimportantClass);
            else expect(count).toHaveClass(textUnimportantClass);
        });

        test(`should render 'sprout' card count as ${remaining.learning}`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const label = screen.queryByText(/sprouts/i);
            const count = label?.nextSibling;

            expect(label).toBeInTheDocument();
            expect(count).toHaveTextContent(`${remaining.learning}`);
        });

        test(`${remaining.learning ? "should not" : "should"} render 'sprout' card count with unimportant text style`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const count = screen.getByText(/sprouts/i).nextSibling;

            if (remaining.learning) expect(count).not.toHaveClass(textUnimportantClass);
            else expect(count).toHaveClass(textUnimportantClass);
        });

        test(`should render 'growing' card count as ${remaining.review}`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const label = screen.queryByText(/growing/i);
            const count = label?.nextSibling;

            expect(label).toBeInTheDocument();
            expect(count).toHaveTextContent(`${remaining.review}`);
        });

        test(`${remaining.review ? "should not" : "should"} render 'growing' card count with unimportant text style`, () => {
            render(<RemainingCardsGrid remaining={remaining} />);
            const count = screen.getByText(/growing/i).nextSibling;

            if (remaining.review) expect(count).not.toHaveClass(textUnimportantClass);
            else expect(count).toHaveClass(textUnimportantClass);
        });
    });
});
