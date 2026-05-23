import { Zap, RefreshCw, Download, Shield, Cpu, Eye, Keyboard } from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: 'High Performance',
    description: 'No FPS drops. Runs light so you can actually play.',
  },
  {
    icon: RefreshCw,
    title: 'Stable & Updated',
    description: 'Updated frequently. Always compatible with the latest patches.',
  },
  {
    icon: Download,
    title: 'Quick Setup',
    description: 'Download, drop in your mods folder, play.',
  },
  {
    icon: Shield,
    title: 'Undetected',
    description: 'Ghost mode keeps you safe and undetected.',
  },
  {
    icon: Zap,
    title: '80+ Modules',
    description: 'Combat, movement, render, and utility modules.',
  },
  {
    icon: Keyboard,
    title: 'Hotkey: Right Shift > Delete',
    description: 'Press Right Shift then Delete to open the menu. Quick and simple.',
  },
]

export function FeaturesSection() {
  return (
    <section id="modules" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Why choose
            <span className="text-primary"> Pulse</span>?
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
