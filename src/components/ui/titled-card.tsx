import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/base/card";

export interface TitledCardProps {
    title: string;
    children: ReactNode;
}

/**
 * Simple card with a h2-level text title and arbitrary content.
 */
export function TitledCard({ title, children }: TitledCardProps) {
    return (
        <Card>
            <CardHeader>
                <h2 className={"text-center font-bold"}>{title}</h2>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
