import { ContentWrapper } from "@/components/page/content-wrapper";
import { PageTemplate } from "@/components/page/main/template/page-template";
import { Button } from "@/components/shadcn/button";
import { CardDescription } from "@/components/shadcn/card";
import { getUserOrRedirectSC } from "@/lib/utils/server";
import { House } from "lucide-react";
import Link from "next/link";

/**
 * Page to inform the user about failure to find requested data.
 *
 * @returns The component.
 */
export default async function NotFoundPage() {
    const user = await getUserOrRedirectSC();
    return (
        <PageTemplate title="Invalid data" user={user}>
            <ContentWrapper variant="compact" className="gap-y-12">
                <div className="flex flex-col justify-center gap-y-3">
                    <h2 className="text-center text-xl font-bold">
                        The data you are trying to access does not exist
                    </h2>
                    <CardDescription className="text-center">
                        This can happen after deleting something in another tab or on another
                        device, or after incorrectly modifying the page URL by hand.
                    </CardDescription>
                </div>
                <Button
                    asChild
                    className="flex h-24 w-full items-center justify-center space-x-2 rounded-3xl text-xl font-bold [&_svg]:size-10"
                >
                    <Link href="/home">
                        Home <House aria-label="Home icon" />
                    </Link>
                </Button>
            </ContentWrapper>
        </PageTemplate>
    );
}
