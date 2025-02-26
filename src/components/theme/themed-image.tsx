import Image from "next/image";

import { cn } from "@/lib/ui/generic";
import { ImageData, isThemedSrc } from "@/lib/ui/theme";

/**
 * Image that may use different sources based on the current color theme (light or dark).
 *
 * @param props Component properties.
 * @param props.image Image data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function ThemedImage({ image, className }: { image: ImageData; className?: string }) {
    return isThemedSrc(image.src) ? (
        <>
            <Image
                src={image.src.light}
                alt={image.alt}
                className={cn("block dark:hidden", className)}
            />
            <Image
                src={image.src.dark}
                alt={image.alt}
                className={cn("hidden dark:block", className)}
            />
        </>
    ) : (
        <Image src={image.src} alt={image.alt} className={className} />
    );
}
