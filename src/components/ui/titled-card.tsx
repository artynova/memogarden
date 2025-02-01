import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/base/card";

export interface TitledCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

/**
 * Simple card with a h2-level text title, optional description, and arbitrary content.
 */
export function TitledCard({ title, description, children }: TitledCardProps) {
    return (
        <Card>
            <CardHeader>
                <h2 className={"text-center font-bold"}>{title}</h2>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
