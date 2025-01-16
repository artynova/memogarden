import { SelectCard, SelectCardDataView } from "@/server/data/services/card";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";
import { Separator } from "@/components/ui/base/separator";
import { MarkdownProse } from "@/components/ui/markdown-prose";

export interface CardCardProps {
    card: SelectCard | SelectCardDataView;
    onlyFront?: boolean;
    className?: string;
}

/**
 * Generalized component to render content of a flashcard in a card UI element (with or without the back text).
 *
 * @param card Card data.
 * @param onlyFront Whether to show only the card's front without back (off by default).
 * @param className Custom classes.
 */
export function CardCard({ card, onlyFront, className }: CardCardProps) {
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
