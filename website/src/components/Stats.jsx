import { motion } from 'framer-motion'
import CountUp from './CountUp'

const stats = [
  { to: 1000, suffix: '+', label: 'Services Completed' },
  { to: 500, suffix: '+', label: 'Happy Clients' },
  { value: '24/7', label: 'Support Available' },
  { to: 99, suffix: '%', label: 'Satisfaction Rate' },
]

export default function Stats() {
  return (
    <section className="py-20 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ to, suffix, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center gap-1.5"
            >
              <span className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
                {value ? (
                  value
                ) : (
                  <>
                    <CountUp from={0} to={to} separator="," duration={2} />
                    {suffix}
                  </>
                )}
              </span>
              <span className="text-sm text-muted-foreground font-body">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
