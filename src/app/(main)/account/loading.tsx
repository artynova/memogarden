import { PageSkeleton } from "@/components/page/main/skeleton/page-skeleton";

/**
 * Loading skeleton for the route. Hides the footer.
 *
 * @returns The component.
 */
export default function Loading() {
    return <PageSkeleton hideFooter />;
}
