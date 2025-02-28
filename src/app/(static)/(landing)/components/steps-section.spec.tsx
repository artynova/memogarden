import { StepsSection } from "@/app/(static)/(landing)/components/steps-section";
import { ControlledAccordion } from "@/components/controlled-accordion";
import { AdaptiveThemedImage } from "@/components/theme/adaptive-themed-image";
import { fakeCompliantValue } from "@/test/mock/generic";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/controlled-accordion");
vi.mock("@/components/theme/adaptive-themed-image");

const mockedControlledAccordion = vi.mocked(ControlledAccordion);
const mockedAdaptiveThemedImage = vi.mocked(AdaptiveThemedImage);

describe(StepsSection, () => {
    test("should contain a sign-up call to action", () => {
        render(<StepsSection />);
        const signupButton = screen.queryByRole("link", { name: /sign up/i });

        expect(signupButton).toBeInTheDocument();
        expect(signupButton).toHaveAttribute("href", "/signup");
    });

    test("should initially render the first step in the accordion as expanded", () => {
        render(<StepsSection />);

        expect(mockedControlledAccordion).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ currentIndex: 0 }),
            {},
        );
    });

    test.each([{ target: 1 }, { target: 2 }, { target: 3 }])(
        "should correctly manage accordion state and pass updated current index after the accordion notifies about a click on the item at index $target",
        async ({ target }) => {
            let capturedOnCurrentIndexChange: (index: number) => void;
            mockedControlledAccordion.mockImplementation(({ onCurrentIndexChange }) => {
                capturedOnCurrentIndexChange = onCurrentIndexChange; // Interaction with real clicks is verified in accordion tests, so just capture the handler to fake them at the accordion level
                return <></>;
            });

            render(<StepsSection />);
            capturedOnCurrentIndexChange!(target);

            await waitFor(() => {
                expect(mockedControlledAccordion).toHaveBeenCalledTimes(2);
                expect(mockedControlledAccordion).toHaveBeenLastCalledWith(
                    expect.objectContaining({ currentIndex: target }),
                    {},
                );
            });
        },
    );

    test.each([{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }])(
        "should render an adaptive themed image with source corresponding to step when step index is $index",
        async ({ index }) => {
            let capturedOnCurrentIndexChange: (index: number) => void;
            mockedControlledAccordion.mockImplementation(({ onCurrentIndexChange }) => {
                capturedOnCurrentIndexChange = onCurrentIndexChange;
                return <></>;
            });

            render(<StepsSection />);
            capturedOnCurrentIndexChange!(index);

            await waitFor(() => {
                expect(mockedAdaptiveThemedImage).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        image: fakeCompliantValue(
                            expect.objectContaining({
                                src: fakeCompliantValue(
                                    expect.objectContaining({
                                        light: fakeCompliantValue(
                                            expect.stringContaining(`step-${index + 1}`),
                                        ),
                                    }),
                                ),
                            }),
                        ),
                    }),
                    {},
                );
            });
        },
    );
});
