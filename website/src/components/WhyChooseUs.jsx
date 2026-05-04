import { motion } from 'framer-motion'
import { BadgeCheck, Radio, Lock, Headphones, Eye } from 'lucide-react'

const trustPoints = [
  {
    icon: BadgeCheck,
    title: 'Verified Professionals',
    description: 'Every team member and integration partner is rigorously vetted before going live.',
  },
  {
    icon: Radio,
    title: 'Real-Time Updates',
    description: 'Live sync across your entire workflow so nothing ever falls through the cracks.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'PCI-DSS compliant infrastructure with end-to-end encryption on every transaction.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated human support available around the clock — not just a chatbot.',
  },
  {
    icon: Eye,
    title: 'Transparent Process',
    description: 'Full audit logs and reporting so you always know exactly what happened and when.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="rounded-2xl bg-background border border-border p-10 md:p-14 flex flex-col lg:flex-row gap-14">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:w-[38%] shrink-0"
          >
            <p className="text-sm font-medium text-accent font-body mb-3 tracking-wide uppercase">
              Why Taskzy
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1] mb-5">
              Built for teams that demand more
            </h2>
            <p className="text-muted-foreground font-body text-base leading-relaxed">
              We don't just automate tasks — we give your team the confidence, clarity, and control to move faster without sacrificing quality or security.
            </p>
          </motion.div>

          {/* Right: Trust points */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trustPoints.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-foreground font-body text-sm mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
