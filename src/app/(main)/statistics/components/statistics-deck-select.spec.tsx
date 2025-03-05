import { StatisticsDeckSelect } from "@/app/(main)/statistics/components/statistics-deck-select";
import { ControlledSelect } from "@/components/controlled-select";
import { NO_DECK_OPTION } from "@/lib/utils/input";
import { stringifyWithSingleSpaces } from "@/test/display";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/components/controlled-select", () => ({
    ControlledSelect: vi.fn(),
}));
vi.mock("next/navigation");

const mockedControlledSelect = vi.mocked(ControlledSelect);
const mockedUseRouter = vi.mocked(useRouter);

describe.each([
    {
        options: [
            { label: "Deck 1", value: "option3" },
            { label: "Deck 2", value: "option2" },
            { label: "Deck 3", value: "option1" },
        ],
        currentIndex: null,
    },
    {
        options: [
            { label: "Japanese", value: "uuid1" },
            { label: "Polish", value: "uuid2" },
            { label: "German", value: "uuid3" },
            { label: "English", value: "uuid4" },
        ],
        currentIndex: 1,
    },
])(StatisticsDeckSelect, ({ options, currentIndex }) => {
    const mockRouterPush = vi.fn();
    const optionsString = stringifyWithSingleSpaces(options);
    const currentId = currentIndex === null ? null : options[currentIndex].value;

    beforeEach(() => {
        mockedUseRouter.mockReturnValue(fakeCompliantValue({ push: mockRouterPush }));
    });

    test(`should render the 'no deck selected' option with value '${NO_DECK_OPTION}' alongside given options ${optionsString}`, () => {
        render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

        expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                options: fakeCompliantValue(
                    expect.arrayContaining([expect.objectContaining({ value: NO_DECK_OPTION })]),
                ),
            }),
            {},
        );
    });

    test(`should render all given options ${optionsString}`, () => {
        render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

        expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                options: fakeCompliantValue(expect.arrayContaining(options)),
            }),
            {},
        );
    });

    test(`should initialize current select value to '${currentId}' given current deck ID '${currentId}' and deck options ${optionsString}`, () => {
        const expected = currentId ?? NO_DECK_OPTION;

        render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

        expect(mockedControlledSelect).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                value: expected,
            }),
            {},
        );
    });

    test.each(
        [null, ...options.keys()]
            .filter((index) => index != currentIndex)
            .map((index) => ({ targetIndex: index })),
    )(
        `should correctly update current route when clicking on option at index $targetIndex given options ${optionsString} and currently selected option index ${currentIndex}`,
        ({ targetIndex }) => {
            const targetValue = targetIndex === null ? NO_DECK_OPTION : options[targetIndex].value;
            mockedControlledSelect.mockImplementation(({ onValueChange }) => {
                onValueChange(targetValue);
                return <></>;
            });

            render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

            expect(mockRouterPush).toHaveBeenCalledExactlyOnceWith(
                targetIndex === null ? "/statistics" : `/statistics?deckId=${targetValue}`,
            );
        },
    );
});
