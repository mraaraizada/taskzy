import NumberFlow from '@number-flow/react'
import { Check, Minus, Sparkles, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    tagline: 'For small teams exploring automation.',
    monthly: 29,
    yearly: 23,
    cta: 'Get started free',
    highlight: false,
    features: [
      { text: 'Up to 5 team members', ok: true },
      { text: '20 active workflows', ok: true },
      { text: 'Core analytics dashboard', ok: true },
      { text: 'Email support (48h SLA)', ok: true },
      { text: '5 GB storage', ok: true },
      { text: 'Custom integrations', ok: false },
      { text: 'SSO & advanced security', ok: false },
      { text: 'Dedicated account manager', ok: false },
    ],
  },
  {
    name: 'Pro',
    tagline: 'For growing teams that need more power.',
    monthly: 79,
    yearly: 63,
    cta: 'Start free trial',
    highlight: true,
    badge: 'Most popular',
    features: [
      { text: 'Up to 25 team members', ok: true },
      { text: 'Unlimited workflows', ok: true },
      { text: 'Advanced analytics & reports', ok: true },
      { text: 'Priority 24/7 support', ok: true },
      { text: '50 GB storage', ok: true },
      { text: 'Custom integrations', ok: true },
      { text: 'SSO & advanced security', ok: false },
      { text: 'Dedicated account manager', ok: false },
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For large orgs with enterprise requirements.',
    monthly: 199,
    yearly: 159,
    cta: 'Contact sales',
    highlight: false,
    features: [
      { text: 'Unlimited team members', ok: true },
      { text: 'Unlimited workflows', ok: true },
      { text: 'Full analytics suite + exports', ok: true },
      { text: 'Dedicated account manager', ok: true },
      { text: '500 GB storage', ok: true },
      { text: 'Custom integrations', ok: true },
      { text: 'SSO & advanced security', ok: true },
      { text: 'Custom SLA & contracts', ok: true },
    ],
  },
]

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section className="py-28 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-accent font-body mb-3 tracking-widest uppercase">
            Pricing
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1]">
            Invest in your team's velocity
          </h2>
          <p className="mt-4 text-muted-foreground font-body text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Transparent pricing, no hidden fees. Start free and scale when you're ready.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium font-body transition-colors ${
                !yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`relative rounded-full px-5 py-2 text-sm font-medium font-body transition-colors flex items-center gap-2 ${
                yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="rounded-full bg-accent/15 text-accent text-xs font-semibold px-2 py-0.5">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map(({ name, tagline, monthly, yearly: yearlyPrice, cta, highlight, badge, features }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl flex flex-col ${
                highlight
                  ? 'bg-foreground text-background ring-2 ring-foreground shadow-[0_32px_80px_rgba(0,0,0,0.18)]'
                  : 'bg-background border border-border shadow-[0_2px_20px_rgba(0,0,0,0.04)]'
              }`}
            >
              {/* Badge */}
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-foreground font-body shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    {badge}
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col gap-6 flex-1">
                {/* Plan name + tagline */}
                <div>
                  <p className={`text-xs font-bold tracking-widest uppercase font-body mb-1 ${highlight ? 'text-background/50' : 'text-muted-foreground'}`}>
                    {name}
                  </p>
                  <p className={`text-sm font-body leading-relaxed ${highlight ? 'text-background/60' : 'text-muted-foreground'}`}>
                    {tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1.5">
                  <span className={`font-display text-5xl tracking-tight leading-none ${highlight ? 'text-background' : 'text-foreground'}`}>
                    $<NumberFlow
                      value={yearly ? yearlyPrice : monthly}
                      className="font-display text-5xl tracking-tight"
                    />
                  </span>
                  <div className="mb-1">
                    <p className={`text-xs font-body leading-tight ${highlight ? 'text-background/50' : 'text-muted-foreground'}`}>
                      per seat / mo
                    </p>
                    <AnimatePresence mode="wait">
                      {yearly && (
                        <motion.p
                          key="saving"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className={`text-xs font-body line-through ${highlight ? 'text-background/30' : 'text-muted-foreground/50'}`}
                        >
                          ${monthly} billed monthly
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${highlight ? 'bg-background/10' : 'bg-border'}`} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1">
                  {features.map(({ text, ok }) => (
                    <li key={text} className="flex items-start gap-3 text-sm font-body">
                      {ok ? (
                        <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${highlight ? 'bg-background/15' : 'bg-accent/10'}`}>
                          <Check className={`w-2.5 h-2.5 ${highlight ? 'text-background' : 'text-accent'}`} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-border/60">
                          <Minus className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={3} />
                        </span>
                      )}
                      <span className={
                        ok
                          ? (highlight ? 'text-background/85' : 'text-foreground')
                          : 'text-muted-foreground/50 line-through'
                      }>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full rounded-full py-3 text-sm font-semibold font-body transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 ${
                    highlight
                      ? 'bg-background text-foreground shadow-sm'
                      : 'bg-foreground text-background'
                  }`}
                >
                  {highlight && <Zap className="w-3.5 h-3.5" />}
                  {cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-muted-foreground font-body mt-8"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  )
}
