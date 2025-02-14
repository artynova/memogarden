// Strictly client component

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/shadcn/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { SelectAvatar } from "@/server/data/services/user";
import { Button } from "@/components/shadcn/button";
import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { AvatarSkeleton } from "@/components/page/skeleton/avatar-skeleton";
import { cn } from "@/lib/ui/generic";

/**
 * Carousel-based selector of a user avatar image from the app's predefined options.
 *
 * @param props Component properties.
 * @param props.avatars List of available avatars for this selection.
 * @param props.avatarIndex Index of the user's current avatar in the provided array of avatars.
 * @param props.onAvatarChange Avatar change callback, receives the index of the newly selected avatar.
 * @param props.className Custom classes.
 * @param props.id HTML ID for the carousel element.
 * @returns The component.
 */
export function ControlledSelectAvatar({
    avatars,
    avatarIndex,
    onAvatarChange,
    className,
    id,
}: {
    avatarIndex: number;
    onAvatarChange: (index: number) => void;
    avatars: SelectAvatar[];
    className?: string;
    id?: string;
}) {
    const [api, setApi] = useState<CarouselApi>();
    const [currentSnap, setCurrentSnap] = useState<number>(avatarIndex);

    useEffect(() => {
        if (!api) return () => {}; // Nothing to unsubscribe from, returning the function is just required by the hook

        const onCarouselSelect = () => {
            setCurrentSnap(api.selectedScrollSnap());
        };

        api.on("select", onCarouselSelect);
        return () => api.off("select", onCarouselSelect); // Unsubscribe from the API event
    }, [api]);

    return (
        <div className={"flex flex-col items-center gap-6"}>
            <div className={"w-full px-14"}>
                <Carousel
                    setApi={setApi}
                    className={cn("mx-auto max-w-96", className)}
                    opts={{ startIndex: avatarIndex }}
                    id={id}
                >
                    <CarouselContent>
                        {avatars.map((avatar) => (
                            <CarouselItem key={avatar.id} className={"basis-full"}>
                                <div className={"flex items-center justify-center"}>
                                    <Avatar
                                        className={cn(
                                            "size-32 border-8 sm:size-64",
                                            avatarIndex === avatar.id
                                                ? "border-accent"
                                                : "border-muted",
                                        )}
                                    >
                                        <AvatarImage
                                            src={`/avatars/${avatar.id}.png`}
                                            alt={`Avatar ${avatar.id + 1}`}
                                        />
                                        <AvatarFallback>
                                            <AvatarSkeleton />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            {currentSnap === avatarIndex ? (
                <Button className={"w-full sm:w-1/2"} disabled>
                    <span>Selected</span>
                    <CheckCheck aria-label={"Selected icon"} />
                </Button>
            ) : (
                <Button className={"w-full sm:w-1/2"} onClick={() => onAvatarChange(currentSnap)}>
                    <span>Select</span>
                    <Check aria-label={"Select icon"} />
                </Button>
            )}
        </div>
    );
}
