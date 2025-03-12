import { AdaptiveMockup } from "@/components/mockup/adaptive-mockup";
import { DesktopMockup } from "@/components/mockup/desktop-mockup";
import { MobileMockup } from "@/components/mockup/mobile-mockup";
import { ThemedImageSrc } from "@/lib/ui/theme";
import { render } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/mockup/desktop-mockup");
vi.mock("@/components/mockup/mobile-mockup");

const mockedDesktopMockup = vi.mocked(DesktopMockup);
const mockedMobileMockup = vi.mocked(MobileMockup);

describe(AdaptiveMockup, () => {
    describe.each([
        {
            desktopImage: { src: { src: "testsrc" } as StaticImageData, alt: "testalt_desktop" },
            mobileImage: { src: { src: "testsrc" } as StaticImageData, alt: "testalt_mobile" },
        },
        {
            desktopImage: {
                src: {
                    light: { src: "testsrc_light_desktop" },
                    dark: { src: "testsrc_dark_desktop" },
                } as ThemedImageSrc,
                alt: "testalt_desktop",
            },
            mobileImage: {
                src: {
                    light: { src: "testsrc_light_mobile" },
                    dark: { src: "testsrc_dark_mobile" },
                } as ThemedImageSrc,
                alt: "testalt_mobile",
            },
        },
    ])(
        "given desktop image $desktopImage and mobile image $mobileImage",
        ({ desktopImage, mobileImage }) => {
            test(`should forward desktop image data to 'DesktopMockup'`, () => {
                render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

                expect(mockedDesktopMockup).toHaveBeenCalledOnceWithProps({ image: desktopImage });
            });

            test(`should show desktop image on wide screens and hide on mobile screens`, () => {
                render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

                expect(mockedDesktopMockup).toHaveBeenCalledOnceWithProps({
                    className: expect.stringContaining("hidden sm:block"),
                });
            });

            test(`should forward mobile image data to 'MobileMockup'`, () => {
                render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

                expect(mockedMobileMockup).toHaveBeenCalledOnceWithProps({ image: mobileImage });
            });

            test(`should show mobile image on mobile screens and hide on wide screens`, () => {
                render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

                expect(mockedMobileMockup).toHaveBeenCalledOnceWithProps({
                    className: expect.stringContaining("block sm:hidden"),
                });
            });
        },
    );
});
