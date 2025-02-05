"use client";

import { ImageData } from "@/lib/ui";
import { ThemedImage } from "@/components/ui/themed-image";
import { cn } from "@/lib/utils";

export interface AdaptiveImageProps {
    image: ImageData;
    imageMobile?: ImageData;
    className?: string;
}

export function AdaptiveThemedImage({ image, imageMobile, className }: AdaptiveImageProps) {
    return imageMobile === undefined ? (
        <div className={cn("overflow-hidden", className)}>
            <ThemedImage image={image} className={className} />
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
