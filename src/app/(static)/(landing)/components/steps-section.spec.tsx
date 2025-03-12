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
    test("should contain sign-up call to action", () => {
        render(<StepsSection />);
        const signupButton = screen.queryByRole("link", { name: /sign up/i });

        expect(signupButton).toBeInTheDocument();
        expect(signupButton).toHaveAttribute("href", "/signup");
    });

    describe("given no user interaction", () => {
        test("should render first step as expanded", () => {
            render(<StepsSection />);

            expect(mockedControlledAccordion).toHaveBeenCalledOnceWithProps({ currentIndex: 0 });
        });
    });

    describe.each([{ target: 1 }, { target: 2 }, { target: 3 }])(
        "when step heading at index $target is clicked",
        ({ target }) => {
            test("should pass updated current index to 'ControlledAccordion'", async () => {
                let capturedOnCurrentIndexChange: ((index: number) => void) | undefined;
                mockedControlledAccordion.mockImplementation(({ onCurrentIndexChange }) => {
                    capturedOnCurrentIndexChange = onCurrentIndexChange; // Interaction with real clicks is verified in accordion tests, so just capture the handler to fake them at the accordion level
                    return <></>;
                });

                render(<StepsSection />);
                capturedOnCurrentIndexChange?.(target);

                await waitFor(() => {
                    expect(mockedControlledAccordion).toHaveBeenCalledTimes(2);
                    expect(mockedControlledAccordion).toHaveBeenLastCalledWithProps({
                        currentIndex: target,
                    });
                });
            });
        },
    );

    describe.each([{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }])(
        "given current step index $index",
        ({ index }) => {
            test("should render an adaptive themed image with source corresponding to step when step index is $index", async () => {
                let capturedOnCurrentIndexChange: ((index: number) => void) | undefined;
                mockedControlledAccordion.mockImplementation(({ onCurrentIndexChange }) => {
                    capturedOnCurrentIndexChange = onCurrentIndexChange;
                    return <></>;
                });

                render(<StepsSection />);
                capturedOnCurrentIndexChange?.(index);

                await waitFor(() => {
                    expect(mockedAdaptiveThemedImage).toHaveBeenLastCalledWithProps({
                        image: expect.objectContaining({
                            src: fakeCompliantValue(
                                expect.objectContaining({
                                    light: fakeCompliantValue(
                                        expect.stringContaining(`step-${index + 1}`),
                                    ),
                                }),
                            ),
                        }),
                    });
                });
            });
        },
    );
});
