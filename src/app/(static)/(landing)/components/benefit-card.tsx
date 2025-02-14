import { Card, CardHeader } from "@/components/shadcn/card";
import { GenericIconType } from "@/lib/ui/generic";

/**
 * Benefit card in the benefits section of the landing page.
 *
 * @param props Component properties.
 * @param props.Icon Card icon.
 * @param props.title Card title.
 * @returns the component.
 */
export function BenefitCard({ Icon, title }: { Icon: GenericIconType; title: string }) {
    return (
        <Card className={"rounded-xl"}>
            <CardHeader className={"gap-4"}>
                <Icon aria-label={`${title} icon`} />
                {title}
            </CardHeader>
        </Card>
    );
}
