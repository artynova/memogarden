import { Flower, Layers, ScrollText } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { Section } from "@/app/(static)/(landing)/components/section";

import Hero from "../../../../../public/static/landing/hero.png";
import HeroDark from "../../../../../public/static/landing/hero-dark.png";
import HeroMobile from "../../../../../public/static/landing/hero-mobile.png";
import HeroMobileDark from "../../../../../public/static/landing/hero-mobile-dark.png";
import { AdaptiveMockup } from "@/components/mockup/adaptive-mockup";

/**
 * Landing page hero section with main draws of the app and a device-specific screenshot wrapped by a device-specific
 * mockup (i.e., desktop screenshot wrapped by a monitor mockup or mobile screenshot wrapped by a smartphone mockup).
 *
 * @returns The component.
 */
export function HeroSection() {
    return (
        <Section className="gap-y-6 bg-background pt-12">
            <div className="flex flex-col items-center gap-y-6 px-6">
                <div className="text-center">
                    <h1 className="flex justify-center text-4xl font-bold">
                        Take the tedium out of revision
                    </h1>
                    <h2 className="flex justify-center text-2xl">
                        A flashcard app where your knowledge grows &mdash; literally
                    </h2>
                </div>
                <Button className="h-12 px-8 text-xl" asChild>
                    <Link href="/signup">Sign up</Link>
                </Button>
                <AdaptiveMockup
                    image={{
                        src: { light: Hero, dark: HeroDark },
                        alt: "Screenshot of the desktop dashboard UI in the MemoGarden app with two visible decks - Japanese and Polish. There are several cards due for review.",
                    }}
                    imageMobile={{
                        src: { light: HeroMobile, dark: HeroMobileDark },
                        alt: "Screenshot of the mobile dashboard UI in the MemoGarden app with two visible decks - Japanese and Polish. There are several cards due for review.",
                    }}
                />
            </div>
            <div className="flex w-full flex-col items-center gap-12 bg-secondary p-8 px-12 md:flex-row md:justify-center">
                <ul className="flex w-fit flex-col gap-12 sm:flex-row sm:justify-stretch">
                    <li className="flex items-center gap-x-4">
                        <ScrollText className="size-10" aria-label="Flashcard icon" />
                        Grow your memory garden &mdash; One flashcard at a time
                    </li>
                    <li className="flex items-center gap-x-4">
                        <Layers className="size-10" aria-label="Many flashcards icon" />
                        Never cram again &mdash; Let spaced repetition do the work
                    </li>
                    <li className="flex items-center gap-x-4">
                        <Flower className="size-10" aria-label="Flower icon" />
                        Stay on track &mdash; Or watch your garden wilt!
                    </li>
                </ul>
                <Button className="h-12 w-full px-8 md:w-auto" asChild>
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
        </Section>
    );
}
