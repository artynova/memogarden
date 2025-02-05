import { ThemeProvider } from "@/components/ui/theme-provider";
import { HeroSection } from "@/app/(landing)/components/hero-section";
import { StepsSection } from "@/app/(landing)/components/steps-section";
import { BenefitsSection } from "@/app/(landing)/components/benefits-section";
import { Header } from "@/app/(landing)/components/header";
import { Footer } from "@/app/(landing)/components/footer";

export default function Home() {
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
