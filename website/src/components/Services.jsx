import { motion } from 'framer-motion'
import { Zap, BarChart2, Shield, RefreshCw, Bell, Layers } from 'lucide-react'

const services = [
  {
    icon: Zap,
    title: 'Instant Automation',
    description: 'Deploy intelligent workflows in seconds with zero manual setup.',
  },
  {
    icon: BarChart2,
    title: 'Advanced Analytics',
    description: 'Real-time insights and dashboards that surface what matters most.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance baked in from the ground up.',
  },
  {
    icon: RefreshCw,
    title: 'Seamless Integrations',
    description: 'Connect your entire stack with 200+ native integrations.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Context-aware alerts that reach the right person at the right time.',
  },
  {
    icon: Layers,
    title: 'Scalable Infrastructure',
    description: 'Grows with your team from 5 to 50,000 users without friction.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Services() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-sm font-medium text-accent font-body mb-3 tracking-wide uppercase">
            What we offer
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1]">
            Everything your team needs
          </h2>
          <p className="mt-4 text-muted-foreground font-body text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            A complete suite of intelligent tools designed to eliminate busywork and accelerate growth.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              className="group rounded-xl border border-border bg-background p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-shadow duration-300"
            >
              <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
                <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
