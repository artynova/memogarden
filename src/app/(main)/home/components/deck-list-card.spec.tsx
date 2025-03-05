import { DeckListCard } from "@/app/(main)/home/components/deck-list-card";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { DeckHealthBarWithLabel } from "@/components/resource/bars/deck-health-bar-with-label";
import { RemainingCardsGrid } from "@/components/resource/remaining-cards-grid";
import { DeckPreview } from "@/server/data/services/deck";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/limited-text-span");
vi.mock("@/components/resource/remaining-cards-grid");
vi.mock("@/components/resource/bars/deck-health-bar-with-label");

const mockedLimitedTextSpan = vi.mocked(LimitedTextSpan);
const mockedRemainingCardsGrid = vi.mocked(RemainingCardsGrid);
const mockedDeckHealthBarWithLabel = vi.mocked(DeckHealthBarWithLabel);

describe(DeckListCard, () => {
    describe.each([
        {
            preview: {
                deck: { id: "uuid1", name: "Japanese", retrievability: 0.7 },
                remaining: { new: 2, learning: 5, review: 16 },
            } as DeckPreview,
            canReview: true,
        },
        {
            preview: {
                deck: { id: "uuid2", name: "Polish", retrievability: 1 },
                remaining: { new: 0, learning: 0, review: 0 },
            } as DeckPreview,
            canReview: false,
        },
    ])("given deck preview data $preview", ({ preview, canReview }) => {
        test("should render one deck page link with correct href value", () => {
            const expectedHref = `/deck/${preview.deck.id}`;

            render(<DeckListCard preview={preview} />);
            const links = screen
                .getAllByRole("link")
                .filter((link) => link.getAttribute("href") === expectedHref);

            expect(links.length).toEqual(1);
        });

        test("should use trimmed deck name as the card title", () => {
            mockedLimitedTextSpan.mockImplementation(({ text }) => <>{text}</>);

            render(<DeckListCard preview={preview} />);
            const heading = screen.queryByRole("heading", { level: 2 });

            expect(heading).toBeInTheDocument();
            expect(mockedLimitedTextSpan).toHaveBeenCalledOnceWithProps({
                text: preview.deck.name,
            });
        });

        test("should forward preview data to the remaining cards grid", () => {
            render(<DeckListCard preview={preview} />);

            expect(mockedRemainingCardsGrid).toHaveBeenCalledOnceWithProps({
                remaining: preview.remaining,
            });
        });

        test("should render the deck health bar with correct retrievability and test value representation", () => {
            render(<DeckListCard preview={preview} />);

            expect(mockedDeckHealthBarWithLabel).toHaveBeenCalledOnceWithProps({
                retrievability: preview.deck.retrievability,
                withBarText: true,
            });
        });

        if (canReview) {
            test("should render the review button as a link with correct href", () => {
                const expectedHref = `/deck/${preview.deck.id}/review`;

                render(<DeckListCard preview={preview} />);
                const links = screen
                    .getAllByRole("link")
                    .filter((link) => link.getAttribute("href") === expectedHref);

                expect(links.length).toEqual(1);
            });
        } else {
            test("should render the review button as a disabled button", () => {
                render(<DeckListCard preview={preview} />);
                const button = screen.queryByRole("button");

                expect(button).toBeInTheDocument();
                expect(button).toHaveAttribute("disabled", "");
            });
        }
    });
});
