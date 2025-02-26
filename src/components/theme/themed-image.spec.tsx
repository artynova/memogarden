import { describe, expect, test } from "vitest";
import { ThemedImage } from "@/components/theme/themed-image";
import { render, screen } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { ImageData, ThemedImageSrc } from "@/lib/ui/theme";

describe(ThemedImage, () => {
    test("should correctly render one image when the source is not themed", () => {
        const mockSource = { src: "testsrc" } as StaticImageData;
        const mockData: ImageData = { src: mockSource, alt: "testalt" };
        render(<ThemedImage image={mockData} />);
        const image = screen.queryByRole("img");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", mockSource.src);
        expect(image).toHaveAttribute("alt", mockData.alt);
    });

    test("should correctly render two images - one for each color theme - when the source is themed", () => {
        const mockSource = {
            light: { src: "testsrc_light" },
            dark: { src: "testsrc_dark" },
        } as ThemedImageSrc;
        const mockData: ImageData = { src: mockSource, alt: "testalt" };
        render(<ThemedImage image={mockData} />);
        const images = screen.getAllByRole("img");

        expect(images.length).toEqual(2);
        for (const image of images) {
            const isLight = image.getAttribute("src") === mockSource.light.src;
            const isDark = image.getAttribute("src") === mockSource.dark.src;

            expect(isLight || isDark).toBeTruthy();
            if (isLight) expect(image).toHaveClass("dark:hidden");
            else expect(image).toHaveClass("hidden dark:block");
            expect(image).toHaveAttribute("alt", mockData.alt);
        }
    });
});
