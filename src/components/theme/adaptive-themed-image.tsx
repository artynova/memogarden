"use client";

import { ThemedImage } from "@/components/theme/themed-image";

import { cn } from "@/lib/ui/generic";

import { ImageData } from "@/lib/ui/theme";

/**
 * Image that uses different sources based on screen width (desktop or mobile) and potentially color theme (light or
 * dark), with up to four different images in total. The desktop and mobile images have independent alt texts, since the
 * content of the images may differ to create a better device-specific UX.
 *
 * @param props Component properties.
 * @param props.image Desktop image data.
 * @param props.imageMobile Mobile image data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function AdaptiveThemedImage({
    image,
    imageMobile,
    className,
}: {
    image: ImageData;
    imageMobile?: ImageData;
    className?: string;
}) {
    return imageMobile === undefined ? (
        <div className={cn("overflow-hidden", className)}>
            <ThemedImage image={image} />
        </div>
    ) : (
        <>
            <div className={cn("hidden overflow-hidden sm:block", className)}>
                <ThemedImage image={image} />
            </div>
            <div className={cn("block overflow-hidden sm:hidden", className)}>
                <ThemedImage image={imageMobile} />
            </div>
        </>
    );
}
