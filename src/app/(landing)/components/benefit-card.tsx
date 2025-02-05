import { Card, CardHeader } from "@/components/ui/base/card";
import { ElementType } from "react";

export interface BenefitCardProps {
    Icon: ElementType;
    title: string;
}

export function BenefitCard({ Icon, title }: BenefitCardProps) {
    return (
        <Card className={"rounded-xl"}>
            <CardHeader className={"gap-4"}>
                <Icon aria-label={`${title} icon`} />
                {title}
            </CardHeader>
        </Card>
    );
}
