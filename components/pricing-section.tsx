import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Pulse Free',
    price: '$0',
    period: '7 days',
    description: 'Free for Media creators',
    features: ['20+ Modules', 'Basic Support', 'Regular Updates', 'Community Access', '7 Days for Media'],
    popular: false,
    cta: 'Download Free',
  },
  {
    name: 'Pulse+ Monthly',
    price: '$5',
    period: '/month',
    description: 'Full access to all features',
    features: ['80+ Modules', 'Priority Support', 'Early Updates', 'Discord Access', 'Custom Configs'],
    popular: true,
    cta: 'Get Started',
  },
  {
    name: 'Pulse+ Lifetime',
    price: '$15',
    period: 'one-time',
    description: 'Best value for dedicated users',
    features: ['Everything in Monthly', 'Lifetime Updates', 'VIP Support', 'Exclusive Modules', 'Early Beta Access'],
    popular: false,
    cta: 'Get Lifetime',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Choose your <span className="text-primary">plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Start free or upgrade for the full experience.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-primary bg-card'
                  : 'border-border/50 bg-card/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground"> {plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
