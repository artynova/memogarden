// Strictly client component, does not have the "use client" directive because it needs to accept a callback

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/base/carousel";
import { Avatar, AvatarImage } from "@/components/ui/base/avatar";
import { cn } from "@/lib/utils";
import { SelectAvatar } from "@/server/data/services/user";
import { Button } from "@/components/ui/base/button";
import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";

export interface ControlledSelectAvatarProps {
    avatarIndex: number;
    onAvatarIndexChange: (id: number) => void;
    avatars: SelectAvatar[];
    className?: string;
}

/**
 * Carousel-based selector of a user avatar image from the app's predefiend options.
 *
 * @param avatarIndex Index of the user's current avatar in the provided array of avatars.
 * @param onAvatarIndexChange Callback to handle selection of a new avatar.
 * @param avatars List of available avatars for this selection.
 * @param className Custom classes.
 */
export function ControlledSelectAvatar({
    avatarIndex,
    onAvatarIndexChange,
    avatars,
    className,
}: ControlledSelectAvatarProps) {
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
            <div className={"px-14"}>
                <Carousel
                    setApi={setApi}
                    className={cn("w-full max-w-sm px-14", className)}
                    opts={{ startIndex: avatarIndex }}
                >
                    <CarouselContent>
                        {avatars.map((avatar) => (
                            <CarouselItem key={avatar.id} className={"basis-full"}>
                                <Avatar
                                    className={cn(
                                        "size-auto border-8",
                                        avatarIndex === avatar.id
                                            ? "border-accent"
                                            : "border-muted",
                                    )}
                                >
                                    <AvatarImage src={`/avatars/${avatar.id}.png`} />
                                </Avatar>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            {currentSnap === avatarIndex ? (
                <Button className={"w-full md:w-1/2"} disabled>
                    <span>Selected</span>
                    <CheckCheck />
                </Button>
            ) : (
                <Button
                    className={"w-full md:w-1/2"}
                    onClick={() => onAvatarIndexChange(currentSnap)}
                >
                    <span>Select</span>
                    <Check />
                </Button>
            )}
        </div>
    );
}
