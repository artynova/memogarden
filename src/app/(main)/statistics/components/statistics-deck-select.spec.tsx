import { StatisticsDeckSelect } from "@/app/(main)/statistics/components/statistics-deck-select";
import { ControlledSelect } from "@/components/controlled-select";
import { NO_DECK_OPTION } from "@/lib/utils/input";
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

describe(StatisticsDeckSelect, () => {
    const mockRouterPush = vi.fn();

    beforeEach(() => {
        mockedUseRouter.mockReturnValue(fakeCompliantValue({ push: mockRouterPush }));
    });

    describe.each([
        {
            options: [
                { label: "Deck 1", value: "option3" },
                { label: "Deck 2", value: "option2" },
                { label: "Deck 3", value: "option1" },
            ],
        },
        {
            options: [
                { label: "Japanese", value: "uuid1" },
                { label: "Polish", value: "uuid2" },
                { label: "German", value: "uuid3" },
                { label: "English", value: "uuid4" },
            ],
        },
    ])("given options $options", ({ options }) => {
        test(`should render 'no deck selected' option with value '${NO_DECK_OPTION}'`, () => {
            render(<StatisticsDeckSelect deckId={fakeCompliantValue()} deckOptions={options} />);

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({
                options: expect.arrayContaining([
                    expect.objectContaining({ value: NO_DECK_OPTION }),
                ]),
            });
        });

        test(`should render all provided options`, () => {
            render(<StatisticsDeckSelect deckId={fakeCompliantValue()} deckOptions={options} />);

            expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({
                options: expect.arrayContaining(options),
            });
        });

        describe.each([null, ...options].map((currentOption) => ({ currentOption })))(
            "given current option $option",
            ({ currentOption }) => {
                const currentId = currentOption?.value ?? null;

                test(`should provide initial value '${currentId ?? NO_DECK_OPTION}' to 'ControlledSelect'`, () => {
                    const expected = currentId ?? NO_DECK_OPTION;

                    render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

                    expect(mockedControlledSelect).toHaveBeenCalledOnceWithProps({
                        value: expected,
                    });
                });

                describe.each(
                    [null, ...options]
                        .filter((option) => option != currentOption)
                        .map((option) => ({ targetOption: option })),
                )("when option $option is clicked", ({ targetOption }) => {
                    test("should correctly update current route", () => {
                        const targetValue = targetOption?.value ?? NO_DECK_OPTION;
                        const expectedRoute =
                            targetOption === null
                                ? "/statistics"
                                : `/statistics?deckId=${targetValue}`;
                        mockedControlledSelect.mockImplementation(({ onValueChange }) => {
                            onValueChange(targetValue);
                            return <></>;
                        });

                        render(<StatisticsDeckSelect deckId={currentId} deckOptions={options} />);

                        expect(mockRouterPush).toHaveBeenCalledExactlyOnceWith(expectedRoute);
                    });
                });
            },
        );
    });
});
