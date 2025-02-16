import { HeroSection } from "@/app/(static)/(landing)/components/hero-section";
import { StepsSection } from "@/app/(static)/(landing)/components/steps-section";
import { BenefitsSection } from "@/app/(static)/(landing)/components/benefits-section";
import { PageTemplate } from "@/components/page/static/page-template";

/**
 * Landing page.
 *
 * @returns The component.
 */
export default function Page() {
    return (
        <PageTemplate className="[&_footer]:-mt-20 [&_footer]:pt-20">
            <HeroSection />
            <StepsSection />
            <BenefitsSection />
        </PageTemplate>
    );
}
