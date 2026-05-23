import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { PreviewSection } from '@/components/preview-section'
import { SetupSection } from '@/components/setup-section'
import { PricingSection } from '@/components/pricing-section'
import { ReviewsSection } from '@/components/reviews-section'
import { Footer } from '@/components/footer'
import { DiscordButton } from '@/components/discord-button'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <SetupSection />
      <PricingSection />
      <ReviewsSection />
      <Footer />
      <DiscordButton />
    </main>
  )
}
