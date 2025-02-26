import { AdaptiveMockup } from "@/components/mockup/adaptive-mockup";
import { DesktopMockup } from "@/components/mockup/desktop-mockup";
import { MobileMockup } from "@/components/mockup/mobile-mockup";
import { ThemedImageSrc } from "@/lib/ui/theme";
import { stringifyWithSingleSpaces } from "@/test/display";
import { render } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/mockup/desktop-mockup");
vi.mock("@/components/mockup/mobile-mockup");

const mockedDesktopMockup = vi.mocked(DesktopMockup);
const mockedMobileMockup = vi.mocked(MobileMockup);

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
])(AdaptiveMockup, ({ desktopImage, mobileImage }) => {
    const desktopImageString = stringifyWithSingleSpaces(desktopImage);
    const mobileImageString = stringifyWithSingleSpaces(mobileImage);

    test(`should correctly forward desktop image data to 'DesktopMockup' given desktop image data ${desktopImageString}`, () => {
        render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

        expect(mockedDesktopMockup).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: desktopImage }),
            {},
        );
    });

    test(`should show desktop image on wide screens and hide on mobile screens given desktop image data ${desktopImageString}`, () => {
        render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

        expect(mockedDesktopMockup).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                className: expect.stringContaining("hidden sm:block") as unknown,
            }),
            {},
        );
    });

    test(`should correctly forward mobile image data to 'MobileMockup' given mobile image data ${mobileImageString}`, () => {
        render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

        expect(mockedMobileMockup).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: mobileImage }),
            {},
        );
    });

    test(`should show mobile image on mobile screens and hide on wide screens given mobile image data ${mobileImageString}`, () => {
        render(<AdaptiveMockup image={desktopImage} imageMobile={mobileImage} />);

        expect(mockedMobileMockup).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                className: expect.stringContaining("block sm:hidden") as unknown,
            }),
            {},
        );
    });
});
