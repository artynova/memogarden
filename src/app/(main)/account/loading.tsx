import { PageSkeleton } from "@/components/page/skeleton/page-skeleton";

/**
 * Loading skeleton for the route. Hides the footer.
 *
 * @returns The component.
 */
export default function Loading() {
    return <PageSkeleton hideFooter />;
}
