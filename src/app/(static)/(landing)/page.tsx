import { ThemeProvider } from "@/components/theme/theme-provider";
import { HeroSection } from "@/app/(static)/(landing)/components/hero-section";
import { StepsSection } from "@/app/(static)/(landing)/components/steps-section";
import { BenefitsSection } from "@/app/(static)/(landing)/components/benefits-section";
import { Header } from "@/app/(static)/(landing)/components/header";
import { Footer } from "@/app/(static)/(landing)/components/footer";

/**
 * Landing page.
 *
 * @returns The component.
 */
export default function Page() {
    return (
        <ThemeProvider theme={"system"} doNotPersistTheme>
            <Header />
            <main>
                <HeroSection />
                <StepsSection />
                <BenefitsSection />
            </main>
            <Footer />
        </ThemeProvider>
    );
}
