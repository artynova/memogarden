import { MarkdownProse } from "@/components/markdown/markdown-prose";
import { CardCard } from "@/components/resource/card-card";
import { SelectCardDataView } from "@/server/data/services/card";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/markdown/markdown-prose");

const mockedMarkdownProse = vi.mocked(MarkdownProse);

describe(CardCard, () => {
    describe.each([
        {
            card: {
                front: "**Card front**",
                back: "*Card back*",
            } as SelectCardDataView,
        },
        {
            card: {
                front: "# Hello",
                back: "1. World",
            } as SelectCardDataView,
        },
        {
            card: {
                front: "Hallo",
                back: "__Hello__",
            } as SelectCardDataView,
        },
    ])("given card data $card", ({ card }) => {
        describe("given no value for prop 'onlyFront'", () => {
            test("should forward card front text to card front 'MarkdownProse'", () => {
                render(<CardCard card={card} />);

                expect(mockedMarkdownProse).toHaveBeenCalledTimes(2);
                expect(mockedMarkdownProse).toHaveBeenNthCalledWithProps(1, {
                    children: card.front,
                });
            });

            test("should forward card back text to card back 'MarkdownProse'", () => {
                render(<CardCard card={card} />);

                expect(mockedMarkdownProse).toHaveBeenCalledTimes(2);
                expect(mockedMarkdownProse).toHaveBeenNthCalledWithProps(2, {
                    children: card.back,
                });
            });
        });

        describe("given value 'true' for prop 'onlyFront'", () => {
            test("should forward card front text to card front 'MarkdownProse'", () => {
                render(<CardCard card={card} onlyFront />); // Implicit value "true"

                expect(mockedMarkdownProse).toHaveBeenCalledTimes(1);
                expect(mockedMarkdownProse).toHaveBeenNthCalledWithProps(1, {
                    children: card.front,
                });
            });

            test("should not render card back 'MarkdownProse'", () => {
                render(<CardCard card={card} onlyFront />);

                expect(mockedMarkdownProse).toHaveBeenCalledTimes(1);
                expect(mockedMarkdownProse).not.toHaveBeenCalledWithProps({ children: card.back });
            });
        });
    });
});
