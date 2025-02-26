import { CardCard } from "@/components/resource/card-card";
import { SelectCardDataView } from "@/server/data/services/card";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe.each([
    {
        front: { raw: "**Card front**", markdownCheckTag: "strong" },
        back: { raw: "*Card back*", markdownCheckTag: "em" },
    },
])(CardCard, ({ front, back }) => {
    const conditionString = `given raw front text '${front.raw}' and raw back text '${back.raw}'`;

    test(`should render both card front and back by default ${conditionString}`, () => {
        const card = {
            front: front.raw,
            back: back.raw,
        } as SelectCardDataView;

        render(<CardCard card={card} />);
        const headings = screen.getAllByRole("heading", { level: 2 });
        const frontHeading = screen.queryByRole("heading", { level: 2, name: /question/i });
        const frontContentCheckElement =
            frontHeading?.parentElement?.nextElementSibling?.getElementsByTagName(
                front.markdownCheckTag,
            )[0];
        const backHeading = screen.queryByRole("heading", { level: 2, name: /answer/i });
        const backContentCheckElement =
            backHeading?.parentElement?.nextElementSibling?.getElementsByTagName(
                back.markdownCheckTag,
            )[0];

        expect(headings.length).toEqual(2);
        expect(frontHeading).toBeInTheDocument();
        expect(frontContentCheckElement).toBeInTheDocument();
        expect(backHeading).toBeInTheDocument();
        expect(backContentCheckElement).toBeInTheDocument();
    });

    test(`should only render card front when explicitly specified to do so ${conditionString}`, () => {
        const card = {
            front: front.raw,
            back: back.raw,
        } as SelectCardDataView;

        render(<CardCard card={card} onlyFront />);
        const headings = screen.getAllByRole("heading", { level: 2 });
        const frontHeading = screen.queryByRole("heading", { level: 2, name: /question/i });
        const frontContentCheckElement =
            frontHeading?.parentElement?.nextElementSibling?.getElementsByTagName(
                front.markdownCheckTag,
            )[0];

        expect(headings.length).toEqual(1);
        expect(frontHeading).toBeInTheDocument();
        expect(frontContentCheckElement).toBeInTheDocument();
    });
});
