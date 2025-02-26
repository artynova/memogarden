import { MobileMockup } from "@/components/mockup/mobile-mockup";
import { ThemedImage } from "@/components/theme/themed-image";
import { ThemedImageSrc } from "@/lib/ui/theme";
import { render } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/theme/themed-image");

const mockedThemedImage = vi.mocked(ThemedImage);

describe(MobileMockup, () => {
    test.each([
        { image: { src: { src: "testsrc" } as StaticImageData, alt: "testalt" } },
        {
            image: {
                src: {
                    light: { src: "testsrc_light" },
                    dark: { src: "testsrc_dark" },
                } as ThemedImageSrc,
                alt: "testalt",
            },
        },
    ])(
        "should correctly forward image data to underlying 'ThemedImage' given image data $image",
        ({ image }) => {
            render(<MobileMockup image={image} />);

            expect(mockedThemedImage).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({ image }),
                {},
            );
        },
    );
});
