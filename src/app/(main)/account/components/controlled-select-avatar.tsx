// Strictly client component, does not have the "use client" directive because it needs to accept a callback

import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/base/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/base/avatar";
import { cn } from "@/lib/utils";
import { SelectAvatar } from "@/server/data/services/user";
import { Button } from "@/components/ui/base/button";
import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { AvatarSkeleton } from "@/components/ui/page/skeleton/avatar-skeleton";

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
            <div className={"w-full px-14"}>
                <Carousel
                    setApi={setApi}
                    className={cn("mx-auto max-w-96", className)}
                    opts={{ startIndex: avatarIndex }}
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
                                        <AvatarImage src={`/avatars/${avatar.id}.png`} />
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
                    <CheckCheck />
                </Button>
            ) : (
                <Button
                    className={"w-full sm:w-1/2"}
                    onClick={() => onAvatarIndexChange(currentSnap)}
                >
                    <span>Select</span>
                    <Check />
                </Button>
            )}
        </div>
    );
}
