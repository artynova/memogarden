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
        const baseHref = `/deck/${preview.deck.id}`;

        test(`should render one deck page link with href '${baseHref}'`, () => {
            render(<DeckListCard preview={preview} />);
            const links = screen
                .getAllByRole("link")
                .filter((link) => link.getAttribute("href") === baseHref);

            expect(links.length).toEqual(1);
        });

        test("should use trimmed deck name as card title", () => {
            mockedLimitedTextSpan.mockImplementation(({ text }) => <>{text}</>);

            render(<DeckListCard preview={preview} />);
            const heading = screen.queryByRole("heading", { level: 2 });

            expect(heading).toBeInTheDocument();
            expect(mockedLimitedTextSpan).toHaveBeenCalledOnceWithProps({
                text: preview.deck.name,
            });
        });

        test("should forward preview data to 'RemainingCardsGrid'", () => {
            render(<DeckListCard preview={preview} />);

            expect(mockedRemainingCardsGrid).toHaveBeenCalledOnceWithProps({
                remaining: preview.remaining,
            });
        });

        test("should forward deck retrievability to 'DeckHealthBarWithLabel'", () => {
            render(<DeckListCard preview={preview} />);

            expect(mockedDeckHealthBarWithLabel).toHaveBeenCalledOnceWithProps({
                retrievability: preview.deck.retrievability,
            });
        });

        if (canReview) {
            const expectedHref = `${baseHref}/review`;
            test(`should render review button as link with href ${expectedHref}`, () => {
                render(<DeckListCard preview={preview} />);
                const links = screen
                    .getAllByRole("link")
                    .filter((link) => link.getAttribute("href") === expectedHref);

                expect(links.length).toEqual(1);
            });
        } else {
            test("should render review button as disabled button", () => {
                render(<DeckListCard preview={preview} />);
                const button = screen.queryByRole("button");

                expect(button).toBeInTheDocument();
                expect(button).toBeDisabled();
            });
        }
    });
});
