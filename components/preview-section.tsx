'use client'

import Image from 'next/image'

const previews = [
  {
    src: '/images/preview-1.jpg',
    title: 'CRYSTAL PVP',
    description: 'Full ESP tracers, crystal highlights and entity overlays in a live PvP environment',
  },
  {
    src: '/images/preview-2.jpg',
    title: 'HUD + ARRAYLIST',
    description: 'Arraylist sidebar, player stats display and active module overlay with live tracers',
  },
  {
    src: '/images/preview-3.jpg',
    title: 'TRACER / ESP VIEW',
    description: 'Multi-colour tracers and storage ESP rendering across the server world',
  },
  {
    src: '/images/preview-4.jpg',
    title: 'MODULE MENU',
    description: 'Full categorised panel — Combat, Crystal, Player, Movement, Render and Misc',
  },
]

export function PreviewSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <p className="text-accent text-sm font-mono mb-2">// SCREENSHOTS</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          CLIENT PREVIEW
        </h2>
        <p className="text-muted-foreground mb-12">
          Hover any screenshot to zoom in
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-accent transition-all duration-300"
            >
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={preview.src}
                  alt={preview.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-accent font-bold text-sm mb-1">
                  {preview.title}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {preview.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
