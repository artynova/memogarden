import { StaticImageData } from "next/image";

/**
 * Theme string name.
 */
export type Theme = "dark" | "light" | "system";

/**
 * Converts optional dark mode boolean value to theme string name.
 *
 * @param darkMode Dark mode flag.
 * @returns Theme name - "system" if the flag is `null`, "dark" if it is set to `true`, and "light"
 * otherwise.
 */
export function darkModeToTheme(darkMode: boolean | null): Theme {
    return darkMode === null ? "system" : darkMode ? "dark" : "light";
}

/**
 * Static image data with different images for light and dark UI themes.
 */
export interface ThemedImageSrc {
    /**
     * Static data for the image used in light mode.
     */
    light: StaticImageData;
    /**
     * Static data for the image used in dark mode.
     */
    dark: StaticImageData;
}

/**
 * Static image data with either a single image or a pair of images for light and dark UI themes.
 */
export type ImageSrc = ThemedImageSrc | StaticImageData;

/**
 * Type guard function checking whether an {@link ImageSrc} object provides theme-specific images.
 *
 * @param src Source object.
 * @returns `true` if the source is themed, `false` otherwise.
 */
export function isThemedSrc(src: ImageSrc): src is ThemedImageSrc {
    return (src as ThemedImageSrc)?.light != undefined;
}

/**
 * Data for rendering a statically imported image (potentially differing by UI theme).
 */
export interface ImageData {
    /**
     * Image source.
     */
    src: ImageSrc;
    /**
     * Alternative text describing the image.
     */
    alt: string;
}
