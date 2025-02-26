import { describe, expect, test } from "vitest";
import { AdaptiveThemedImage } from "@/components/theme/adaptive-themed-image";
import { StaticImageData } from "next/image";
import { ImageData } from "@/lib/ui/theme";
import { render, screen } from "@testing-library/react";

describe(AdaptiveThemedImage, () => {
    test("should render only one image when not supplied different sources for the desktop and mobile image", () => {
        const mockSource = { src: "testsrc" } as StaticImageData;
        const mockData: ImageData = { src: mockSource, alt: "testalt" };

        render(<AdaptiveThemedImage image={mockData} />);
        const image = screen.queryByRole("img");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", mockSource.src);
        expect(image).toHaveAttribute("alt", mockData.alt);
    });

    test("should render both desktop- and mobile-specific images when supplied sources for both", () => {
        const mockSourceDesktop = { src: "testsrc desktop" } as StaticImageData;
        const mockDataDesktop: ImageData = { src: mockSourceDesktop, alt: "testalt desktop" };
        const mockSourceMobile = { src: "testsrc mobile" } as StaticImageData;
        const mockDataMobile: ImageData = { src: mockSourceMobile, alt: "testalt mobile" };

        render(<AdaptiveThemedImage image={mockDataDesktop} imageMobile={mockDataMobile} />);
        const images = screen.getAllByRole("img");

        expect(images.length).toEqual(2);
        for (const image of images) {
            const isDesktop = image.getAttribute("src") === mockSourceDesktop.src;
            const isMobile = image.getAttribute("src") === mockSourceMobile.src;

            expect(isDesktop || isMobile).toBeTruthy();
            if (isDesktop) {
                expect(image).toHaveAttribute("alt", mockDataDesktop.alt);
                expect(image.parentElement).toHaveClass("hidden sm:block");
            } else {
                expect(image).toHaveAttribute("alt", mockDataMobile.alt);
                expect(image.parentElement).toHaveClass("sm:hidden");
            }
        }
    });
});
