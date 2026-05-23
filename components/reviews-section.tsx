import { Star } from 'lucide-react'

const reviews = [
  {
    rating: 5,
    text: 'Best client I have ever used. 100% recommend!',
    plan: 'Pulse+ Lifetime',
  },
  {
    rating: 5,
    text: 'Found 19 bases and farms already. This is insane...',
    plan: 'Pulse+ Lifetime',
  },
  {
    rating: 5,
    text: 'This is the best client. Period.',
    plan: 'Pulse+ Lifetime',
  },
  {
    rating: 5,
    text: 'Best 10/10 would buy again',
    plan: 'Pulse+ Lifetime',
  },
  {
    rating: 5,
    text: 'Works perfectly and the support is amazing!',
    plan: 'Pulse+ Monthly',
  },
  {
    rating: 5,
    text: 'Goated modules. Easy to use.',
    plan: 'Pulse+ Monthly',
  },
]

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Reviews</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            What our <span className="text-primary">users</span> say
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30"
            >
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 font-medium text-foreground">{review.text}</p>
              <p className="mt-4 text-sm text-muted-foreground">{review.plan}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
