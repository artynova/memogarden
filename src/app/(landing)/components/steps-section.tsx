"use client";

import { Section } from "@/app/(landing)/components/section";
import { useState } from "react";
import { AccordionItem, ControlledAccordion } from "@/components/ui/controlled-accordion";

import Step1 from "@/../public/static/landing/step-1.png";
import Step1Dark from "@/../public/static/landing/step-1-dark.png";
import Step1Mobile from "@/../public/static/landing/step-1-mobile.png";
import Step1MobileDark from "@/../public/static/landing/step-1-mobile-dark.png";

import Step2 from "@/../public/static/landing/step-2.png";
import Step2Dark from "@/../public/static/landing/step-2-dark.png";
import Step2Mobile from "@/../public/static/landing/step-2-mobile.png";
import Step2MobileDark from "@/../public/static/landing/step-2-mobile-dark.png";

import Step3 from "@/../public/static/landing/step-3.png";
import Step3Dark from "@/../public/static/landing/step-3-dark.png";
import Step3Mobile from "@/../public/static/landing/step-3-mobile.png";
import Step3MobileDark from "@/../public/static/landing/step-3-mobile-dark.png";

import Step4 from "@/../public/static/landing/step-4.png";
import Step4Dark from "@/../public/static/landing/step-4-dark.png";
import Step4Mobile from "@/../public/static/landing/step-4-mobile.png";
import Step4MobileDark from "@/../public/static/landing/step-4-mobile-dark.png";

import { AdaptiveThemedImage } from "@/components/ui/adaptive-themed-image";
import { Button } from "@/components/ui/base/button";
import Link from "next/link";
import { ImageData } from "@/lib/ui";

interface StepItem extends AccordionItem {
    image: ImageData;
    imageMobile?: ImageData;
}

const items: StepItem[] = [
    {
        heading: <h3 className={"text-xl"}>1. Create a deck</h3>,
        content: (
            <p>
                Create decks for different subjects or topics. Whether it&apos;s languages, science,
                or trivia, your decks help keep everything sorted.
            </p>
        ),

        image: {
            src: {
                light: Step1,
                dark: Step1Dark,
            },
            alt: "Screenshot of the desktop deck creation UI in the MemoGarden app",
        },
        imageMobile: {
            src: {
                light: Step1Mobile,
                dark: Step1MobileDark,
            },
            alt: "Screenshot of the mobile deck creation UI in the MemoGarden app",
        },
    },
    {
        heading: <h3 className={"text-xl"}>2. Add flashcards</h3>,
        content: (
            <p>
                Each flashcard belongs to a deck and contains a question-answer pair. Markdown
                formatting is directly supported &mdash; add italics, links, lists, and even code
                blocks with ease!{" "}
                <Link className={"underline"} href={"https://www.markdowntutorial.com"}>
                    Learn Markdown
                </Link>
                .
            </p>
        ),
        image: {
            src: {
                light: Step2,
                dark: Step2Dark,
            },
            alt: "Screenshot of the desktop flashcard creation UI in the MemoGarden app",
        },
        imageMobile: {
            src: {
                light: Step2Mobile,
                dark: Step2MobileDark,
            },
            alt: "Screenshot of the mobile flashcard creation UI in the MemoGarden app",
        },
    },
    {
        heading: <h3 className={"text-xl"}>3. Start reviewing!</h3>,
        content: (
            <p>
                Answer each card, then reveal the correct response. How well did you do? Easy cards
                get pushed back further, while difficult cards will come up again sooner.
            </p>
        ),
        image: {
            src: {
                light: Step3,
                dark: Step3Dark,
            },
            alt: "Screenshot of the desktop flashcard revision UI in the MemoGarden app",
        },
        imageMobile: {
            src: {
                light: Step3Mobile,
                dark: Step3MobileDark,
            },
            alt: "Screenshot of the mobile flashcard revision UI in the MemoGarden app",
        },
    },
    {
        heading: <h3 className={"text-xl"}>4. Stick to your schedule</h3>,
        content: (
            <p>
                As cards fade from memory over time, their &quot;health&quot; declines. Review on
                schedule to keep their contents fresh &mdash; or risk forgetting them and having to
                start over.
            </p>
        ),
        image: {
            src: {
                light: Step4,
                dark: Step4Dark,
            },
            alt: "Screenshot of the desktop dashboard UI in the MemoGarden app showing a deck with somewhat deteriorated card health.",
        },
        imageMobile: {
            src: {
                light: Step4Mobile,
                dark: Step4MobileDark,
            },
            alt: "Screenshot of the mobile dashboard UI in the MemoGarden app showing a deck with somewhat deteriorated card health.",
        },
    },
];

export function StepsSection() {
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const currentItem = items[currentItemIndex];
    return (
        <Section
            className={
                "flex w-full flex-col gap-x-24 gap-y-12 bg-popover px-6 py-12 md:flex-row md:items-start md:justify-between md:px-16"
            }
        >
            <div className={"flex w-11/12 flex-col items-center gap-6 md:w-3/4"}>
                <h2 className={"flex w-full justify-center text-center text-2xl"}>
                    How does it work?
                </h2>
                <ControlledAccordion
                    items={items}
                    currentIndex={currentItemIndex}
                    onCurrentIndexChange={setCurrentItemIndex}
                    className={"w-full"}
                />
            </div>
            <div className={"flex w-full flex-col items-center gap-y-8 md:w-1/2"}>
                <AdaptiveThemedImage
                    image={currentItem.image}
                    imageMobile={currentItem.imageMobile}
                    className={"w-4/6 rounded-2xl border shadow sm:w-full"}
                />
                <Button className={"h-12 w-full px-8"} asChild>
                    <Link href={"/signup"}>Sign up</Link>
                </Button>
            </div>
        </Section>
    );
}
