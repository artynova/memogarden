import { DeviceMockupProps } from "@/components/mockup/common";
import { ThemedImage } from "@/components/theme/themed-image";

/**
 * Mockup of a desktop monitor with image content on the screen.
 *
 * Mockup styling is based on code from https://flowbite.com/docs/components/device-mockups.
 *
 * @param props Component properties.
 * @param props.image Image data.
 * @param props.className Custom classes.
 * @returns The component.
 */
export function DesktopMockup({ image, className }: DeviceMockupProps) {
    return (
        <div className={className}>
            <div className="relative mx-auto w-[90%] max-w-[600px] rounded-t-xl border-[16px] border-gray-800 bg-gray-800 dark:border-gray-800">
                <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800">
                    <ThemedImage image={image} className={"rounded-lg"} />
                </div>
            </div>
            <div className="relative mx-auto h-[42px] w-[90%] max-w-[600px] rounded-b-xl bg-gray-900 dark:bg-gray-700" />
            <div className="relative mx-auto h-[95px] w-1/5 max-w-[140px] rounded-b-xl bg-gray-800" />
        </div>
    );
}
