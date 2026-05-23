import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-16">
      {/* Background glow effect */}
      <div className="hero-glow absolute inset-0" />
      
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-balance">The most </span>
          <span className="italic text-primary">powerful</span>
          <br />
          <span className="text-balance">client</span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          80+ modules. Undetected. Built for performance.
        </p>
        
        <Link href="#pricing" className="mt-8">
          <Button size="lg" className="gap-2 px-8 py-6 text-base font-medium">
            Get started now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
