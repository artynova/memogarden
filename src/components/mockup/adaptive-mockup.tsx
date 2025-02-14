import { cn } from "@/lib/ui/generic";

import { ImageData } from "@/lib/ui/theme";
import { MobileMockup } from "@/components/mockup/mobile-mockup";
import { DesktopMockup } from "@/components/mockup/desktop-mockup";

/**
 * Adaptive device mockup with image content on the screen. Depending on the window width, it will show either a desktop
 * monitor or a smartphone.
 *
 * @param props Component properties.
 * @param props.image Desktop image data.
 * @param props.imageMobile Mobile image data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function AdaptiveMockup({
    image,
    imageMobile,
    className,
}: {
    image: ImageData;
    imageMobile: ImageData;
    className?: string;
}) {
    return (
        <div className={cn("w-full", className)}>
            <MobileMockup image={imageMobile} className={"block sm:hidden"} />
            <DesktopMockup image={image} className={"hidden sm:block"} />
        </div>
    );
}
