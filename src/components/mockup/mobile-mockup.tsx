import { DeviceMockupProps } from "@/components/mockup/common";
import { ThemedImage } from "@/components/theme/themed-image";

/**
 * Mockup of a smartphone with image content on the screen.
 *
 * Mockup styling is based on code from https://flowbite.com/docs/components/device-mockups.
 *
 * @param props Component properties.
 * @param props.image Image data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function MobileMockup({ image, className }: DeviceMockupProps) {
    return (
        <div className={className}>
            <div className="relative mx-auto w-1/2 max-w-[320px] rounded-[2.5rem] border-[14px] border-gray-800 bg-gray-800 dark:border-gray-800">
                <div className="absolute left-[-16px] top-[12%] h-[5.3%] w-[4px] rounded-s-lg bg-gray-800 dark:bg-gray-800" />
                <div className="absolute left-[-16px] top-[21%] h-[7.7%] w-[4px] rounded-s-lg bg-gray-800 dark:bg-gray-800" />
                <div className="absolute left-[-16px] top-[30%] h-[7.7%] w-[4px] rounded-s-lg bg-gray-800 dark:bg-gray-800" />
                <div className="absolute right-[-16px] top-1/4 h-[10.7%] w-[4px] rounded-e-lg bg-gray-800 dark:bg-gray-800" />
                <div className="w-full overflow-hidden rounded-[2rem] bg-white dark:bg-gray-800">
                    <ThemedImage image={image} />
                </div>
            </div>
        </div>
    );
}
