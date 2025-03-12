import { describe, expect, test } from "vitest";
import { ThemedImage } from "@/components/theme/themed-image";
import { render, screen } from "@testing-library/react";
import { StaticImageData } from "next/image";
import { ImageData, ThemedImageSrc } from "@/lib/ui/theme";

describe(ThemedImage, () => {
    describe("given image source is not themed", () => {
        test("should render only one image", () => {
            const mockSource = { src: "testsrc" } as StaticImageData;
            const mockData: ImageData = { src: mockSource, alt: "testalt" };

            render(<ThemedImage image={mockData} />);
            const image = screen.queryByRole("img");

            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("src", mockSource.src);
            expect(image).toHaveAttribute("alt", mockData.alt);
        });
    });

    describe("given image source is themed", () => {
        const mockSource = {
            light: { src: "testsrc_light" },
            dark: { src: "testsrc_dark" },
        } as ThemedImageSrc;
        const mockData: ImageData = { src: mockSource, alt: "testalt" };

        test("should render one light theme image", () => {
            render(<ThemedImage image={mockData} />);
            const images = screen.getAllByRole("img");
            const image = images.find((img) => img.getAttribute("src") === mockSource.light.src);

            expect(images.length).toEqual(2);
            expect(image).toBeInTheDocument();
            expect(image).toHaveClass("dark:hidden");
            expect(image).toHaveAttribute("alt", mockData.alt);
        });

        test("should render one dark theme image", () => {
            render(<ThemedImage image={mockData} />);
            const images = screen.getAllByRole("img");
            const image = images.find((img) => img.getAttribute("src") === mockSource.dark.src);

            expect(images.length).toEqual(2);
            expect(image).toBeInTheDocument();
            expect(image).toHaveClass("hidden dark:block");
            expect(image).toHaveAttribute("alt", mockData.alt);
        });
    });
});
