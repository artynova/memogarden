import { ImageData } from "@/lib/ui/theme";

/**
 * Properties of a device mockup with image content.
 */
export interface DeviceMockupProps {
    /**
     * Image data.
     */
    image: ImageData;
    /**
     * Custom classes.
     */
    className?: string;
}
