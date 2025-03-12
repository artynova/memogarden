import { describe, expect, test } from "vitest";
import { LimitedTextSpan } from "@/components/limited-text-span";
import { render } from "@testing-library/react";
import { getTrimmedText } from "@/lib/ui/generic";

describe(LimitedTextSpan, () => {
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
    ])(
        "given text $text, length $length, and mobile length $mobileLength",
        ({ text, length, mobileLength }) => {
            test("should render desktop-specific span with trimming output for base length", () => {
                const { container } = render(
                    <LimitedTextSpan
                        text={text}
                        maxLength={length}
                        maxLengthMobile={mobileLength}
                    />,
                );
                const desktopTexts = container.getElementsByClassName("sm:inline");

                expect(desktopTexts.length).toEqual(1);
                expect(desktopTexts[0]).toHaveTextContent(getTrimmedText(text, length));
            });

            test(`should render mobile-specific span with trimming output for ${mobileLength === undefined ? "base" : "mobile"} length`, () => {
                const { container } = render(
                    <LimitedTextSpan
                        text={text}
                        maxLength={length}
                        maxLengthMobile={mobileLength}
                    />,
                );
                const mobileTexts = container.getElementsByClassName("sm:hidden");

                expect(mobileTexts.length).toEqual(1);
                expect(mobileTexts[0]).toHaveTextContent(
                    getTrimmedText(text, mobileLength ?? length),
                );
            });
        },
    );
});
