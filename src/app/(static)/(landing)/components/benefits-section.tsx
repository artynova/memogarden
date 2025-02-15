import { Section } from "@/app/(static)/(landing)/components/section";
import { BenefitCard } from "@/app/(static)/(landing)/components/benefit-card";
import { Calendar1, CircleUser, CloudUpload, Gamepad2, LetterText, TrendingUp } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/shadcn/card";
import { ComponentProps } from "react";

type Benefit = ComponentProps<typeof BenefitCard>;

const benefits: Benefit[] = [
    { Icon: Gamepad2, title: "Turn revision into a game" },
    { Icon: TrendingUp, title: "Track your progress" },
    {
        Icon: Calendar1,
        title: "Follow a review schedule that works",
    },
    { Icon: LetterText, title: "Enjoy flexible formatting with Markdown" },
    {
        Icon: CloudUpload,
        title: "Sync across all devices",
    },
    { Icon: CircleUser, title: "Sign in with email, Google, or Facebook" },
];

/**
 * Landing page benefits section.
 *
 * @returns The component.
 */
export function BenefitsSection() {
    return (
        <Section className="gap-y-12 px-6 pt-12 sm:px-12 md:px-16">
            <h2 className="flex justify-center text-center text-2xl">
                Flashcard app designed to keep you engaged!
            </h2>
            <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {benefits.map(({ Icon, title }) => (
                    <BenefitCard key={title} Icon={Icon} title={title} />
                ))}
            </div>

            <div className="z-10 px-6">
                <Card className="px-6 py-3">
                    <CardHeader>
                        <h3 className="text-center text-2xl">Your garden is waiting for you</h3>
                        <CardDescription className="text-center">
                            Get started on building strong revision habits now!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                        <div className="flex w-full justify-center">
                            <Button className="h-14 px-12" asChild>
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Section>
    );
}
