import { MobileMockup } from "@/components/mockup/mobile-mockup";
import { ThemedImage } from "@/components/theme/themed-image";
import { ThemedImageSrc } from "@/lib/ui/theme";
import { render } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/theme/themed-image");

const mockedThemedImage = vi.mocked(ThemedImage);

describe(MobileMockup, () => {
    describe.each([
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
    ])("given image data $image", ({ image }) => {
        test("should forward data to base 'ThemedImage'", () => {
            render(<MobileMockup image={image} />);

            expect(mockedThemedImage).toHaveBeenCalledOnceWithProps({ image });
        });
    });
});
