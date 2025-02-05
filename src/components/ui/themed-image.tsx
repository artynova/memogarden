import { ImageData, isThemedSrc } from "@/lib/ui";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ThemedImageProps {
    image: ImageData;
    className?: string;
}

export function ThemedImage({ image, className }: ThemedImageProps) {
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
        <Image src={image.src} alt={image.alt} />
    );
}
