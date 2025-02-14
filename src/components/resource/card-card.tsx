import { SelectCard, SelectCardDataView } from "@/server/data/services/card";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { MarkdownProse } from "@/components/markdown-prose";

/**
 * Generalized UI card showing either both the front (question) and the back (answer) or just the front of a flashcard.
 *
 * @param props Component properties.
 * @param props.card Card data.
 * @param props.onlyFront Whether to show only the card's front without the back (false by default).
 * @param props.className Custom classes.
 * @returns The component.
 */
export function CardCard({
    card,
    onlyFront,
    className,
}: {
    card: SelectCard | SelectCardDataView;
    onlyFront?: boolean;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <h2 className={"text-center font-bold"}>{"Question:"}</h2>
            </CardHeader>
            <CardContent>
                <MarkdownProse>{card.front}</MarkdownProse>
            </CardContent>
            {!onlyFront && (
                <>
                    <Separator />
                    <CardHeader>
                        <h2 className={"text-center font-bold"}>{"Answer:"}</h2>
                    </CardHeader>
                    <CardContent>
                        <MarkdownProse>{card.back}</MarkdownProse>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
