import { describe, expect, test } from "vitest";
import { AdaptiveThemedImage } from "@/components/theme/adaptive-themed-image";
import { StaticImageData } from "next/image";
import { ImageData } from "@/lib/ui/theme";
import { render, screen } from "@testing-library/react";

describe(AdaptiveThemedImage, () => {
    describe("given only general 'image' source", () => {
        test("should render only one image", () => {
            const mockSource = { src: "testsrc" } as StaticImageData;
            const mockData: ImageData = { src: mockSource, alt: "testalt" };

            render(<AdaptiveThemedImage image={mockData} />);
            const image = screen.queryByRole("img");

            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("src", mockSource.src);
            expect(image).toHaveAttribute("alt", mockData.alt);
        });
    });

    describe("given both general 'image' source and mobile-specific 'imageMobile' source", () => {
        const mockSourceDesktop = { src: "testsrc desktop" } as StaticImageData;
        const mockDataDesktop: ImageData = { src: mockSourceDesktop, alt: "testalt desktop" };
        const mockSourceMobile = { src: "testsrc mobile" } as StaticImageData;
        const mockDataMobile: ImageData = { src: mockSourceMobile, alt: "testalt mobile" };

        test("should render one desktop-specific image", () => {
            render(<AdaptiveThemedImage image={mockDataDesktop} imageMobile={mockDataMobile} />);
            const images = screen.getAllByRole("img");
            const image = images.find((img) => img.getAttribute("src") === mockSourceDesktop.src);

            expect(images.length).toEqual(2);
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("alt", mockDataDesktop.alt);
            expect(image!.parentElement).toHaveClass("hidden sm:block");
        });

        test("should render one desktop-specific image", () => {
            render(<AdaptiveThemedImage image={mockDataDesktop} imageMobile={mockDataMobile} />);
            const images = screen.getAllByRole("img");
            const image = images.find((img) => img.getAttribute("src") === mockSourceMobile.src);

            expect(images.length).toEqual(2);
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("alt", mockDataMobile.alt);
            expect(image!.parentElement).toHaveClass("sm:hidden");
        });
    });
});
