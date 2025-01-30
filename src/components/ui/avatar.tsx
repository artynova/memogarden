import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps {
    avatarId: number;
    className?: string;
}

export function Avatar({ avatarId, className }: AvatarProps) {
    return (
        <Image
            width={64}
            height={64}
            className={cn("rounded-full", className)}
            src={`/avatars/${avatarId}.png`}
            alt={"Avatar"}
        />
    );
}
