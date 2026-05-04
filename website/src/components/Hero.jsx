import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import DashboardPreview from './DashboardPreview'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4'

const fadeUp = (y, delay = 0, duration = 0.6) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-start pt-12 overflow-hidden px-4">
      {/* Background Video */}
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* 1. Badge */}
        <motion.div {...fadeUp(10, 0, 0.5)} className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body">
            Now with GPT-5 support ✨
          </span>
        </motion.div>

        {/* 2. Headline */}
        <motion.h1
          {...fadeUp(16, 0.1)}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl"
        >
          The Future of{' '}
          <span className="text-accent">Smarter</span>{' '}
          Automation
        </motion.h1>

        {/* 3. Subheadline */}
        <motion.p
          {...fadeUp(16, 0.2)}
          className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
        >
          Automate your busywork with intelligent agents that learn, adapt, and
          execute—so your team can focus on what matters most.
        </motion.p>

        {/* 4. CTA Buttons */}
        <motion.div {...fadeUp(16, 0.3)} className="mt-5 flex items-center gap-3">
          <button className="rounded-full px-6 py-[10px] text-sm font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Book a demo
          </button>
          <button
            className="h-11 w-11 rounded-full border-0 flex items-center justify-center hover:bg-background/80 transition-colors"
            style={{
              background: 'hsl(var(--background))',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Play className="h-4 w-4 fill-foreground text-foreground" />
          </button>
        </motion.div>

        {/* 5. Dashboard Preview */}
        <motion.div {...fadeUp(30, 0.5, 0.8)} className="w-full flex justify-center">
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  )
}
