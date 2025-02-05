import { ImageData } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { ThemedImage } from "@/components/ui/themed-image";

interface DeviceMockupProps {
    image: ImageData;
    className?: string;
}

// Mockup styling is based on code from https://flowbite.com/docs/components/device-mockups/

function MobileMockup({ image, className }: DeviceMockupProps) {
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

function DesktopMockup({ image, className }: DeviceMockupProps) {
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

export interface AdaptiveMockupProps {
    image: ImageData;
    imageMobile: ImageData;
    className?: string;
}

export function AdaptiveMockup({ image, imageMobile, className }: AdaptiveMockupProps) {
    return (
        <div className={cn("w-full", className)}>
            <MobileMockup image={imageMobile} className={"block sm:hidden"} />
            <DesktopMockup image={image} className={"hidden sm:block"} />
        </div>
    );
}
