import { Download, FolderInput, Gamepad2 } from 'lucide-react'

const steps = [
  {
    icon: Download,
    step: '01',
    title: 'Download',
    description: 'Download the latest Pulse Client version.',
  },
  {
    icon: FolderInput,
    step: '02',
    title: 'Install',
    description: 'Put it in your mods folder.',
  },
  {
    icon: Gamepad2,
    step: '03',
    title: 'Play',
    description: 'Launch the game and press Del.',
  },
]

export function SetupSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side - Steps */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quick Setup
            </h2>
            <p className="mt-4 text-muted-foreground">
              Download, drop, play. 3 simple steps.
            </p>

            <div className="mt-10 space-y-8">
              {steps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{item.step}</span>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Info card */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Easy to set up.</p>
                <p className="text-sm text-muted-foreground">Download it, put it in your mods folder. Done.</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-background/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-500">Ready to install</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium text-foreground">1.21.11 Fabric</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Hotkey</span>
                <span className="text-sm font-medium text-foreground">Right Shift</span>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-center text-sm text-muted-foreground">
                Works with <span className="font-medium text-foreground">Fabric 1.21.11</span> out of the box.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
