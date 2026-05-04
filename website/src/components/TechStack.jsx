import { motion } from 'framer-motion'
import { LogoCloud } from './ui/logo-cloud-4'

const logos = [
  { src: 'https://svgl.app/library/react_wordmark.svg', alt: 'React' },
  { src: 'https://svgl.app/library/typescript_wordmark.svg', alt: 'TypeScript' },
  { src: 'https://svgl.app/library/tailwindcss_wordmark.svg', alt: 'Tailwind CSS' },
  { src: 'https://svgl.app/library/nextjs_wordmark_dark.svg', alt: 'Next.js' },
  { src: 'https://svgl.app/library/vercel_wordmark.svg', alt: 'Vercel' },
  { src: 'https://svgl.app/library/github_wordmark_light.svg', alt: 'GitHub' },
  { src: 'https://svgl.app/library/openai_wordmark_light.svg', alt: 'OpenAI' },
  { src: 'https://svgl.app/library/supabase_wordmark_light.svg', alt: 'Supabase' },
]

export default function TechStack() {
  return (
    <section className="py-14 bg-background border-y border-border overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-sm text-muted-foreground font-body tracking-wide uppercase"
        >
          Powered by the tools your team already loves
        </motion.p>
      </div>
      <LogoCloud logos={logos} />
    </section>
  )
}
