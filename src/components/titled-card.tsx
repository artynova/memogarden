import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/shadcn/card";

/**
 * Simple card with a second-level header title, optional description, and arbitrary content.
 *
 * @param props Component properties.
 * @param props.title Title.
 * @param props.description Description.
 * @param props.children Content.
 * @returns The component.
 */
export function TitledCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
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
