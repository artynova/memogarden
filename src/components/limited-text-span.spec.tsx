import { describe, expect, test } from "vitest";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { render } from "@testing-library/react";
import { getTrimmedText } from "@/lib/ui/generic";

// These tests are mainly to test orchestration of desktop- and mobile-specific limits. The trimming logic itself is implemented by a utility function tested elsewhere, so it does not need to be verified here
describe.each([
    {
        text: "test text",
        length: 10,
        mobileLength: undefined,
    },
    {
        text: "test text",
        length: 8,
        mobileLength: undefined,
    },
    {
        text: "test text",
        length: 10,
        mobileLength: 9,
    },
    {
        text: "test text",
        length: 10,
        mobileLength: 8,
    },
    {
        text: "test text",
        length: 5,
        mobileLength: 9,
    },
])(LimitedTextSpan, ({ text, length, mobileLength }) => {
    test(`should render the desktop-specific span correctly when given text ${text} and maximum length ${length}`, () => {
        const { container } = render(
            <LimitedTextSpan text={text} maxLength={length} maxLengthMobile={mobileLength} />,
        );
        const desktopTexts = container.getElementsByClassName("sm:inline");

        expect(desktopTexts.length).toEqual(1);
        expect(desktopTexts[0]).toHaveTextContent(getTrimmedText(text, length));
    });

    test(`should render the mobile-specific span correctly when given text ${text} and maximum ${mobileLength === undefined ? "general" : "mobile"} length ${mobileLength ?? length}`, () => {
        const { container } = render(
            <LimitedTextSpan text={text} maxLength={length} maxLengthMobile={mobileLength} />,
        );
        const mobileTexts = container.getElementsByClassName("sm:hidden");

        expect(mobileTexts.length).toEqual(1);
        expect(mobileTexts[0]).toHaveTextContent(getTrimmedText(text, mobileLength ?? length));
    });
});
