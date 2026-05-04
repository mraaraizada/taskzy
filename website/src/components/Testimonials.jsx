import { motion } from 'framer-motion'
import { TestimonialsColumn } from './ui/testimonials-columns-1'

const testimonials = [
  {
    text: "Taskzy cut our manual reporting time by 80%. The automation is genuinely intelligent — it learns our patterns and gets better every week.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Sarah Chen",
    role: "Head of Operations, Luma",
  },
  {
    text: "We evaluated six platforms. Taskzy was the only one that felt like it was designed for the way modern teams actually work.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Marcus Webb",
    role: "CTO, Fieldstone",
  },
  {
    text: "The dashboard gives me real-time visibility I never had before. Our finance team closed last quarter two weeks faster than ever.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Priya Nair",
    role: "VP Finance, Arclight",
  },
  {
    text: "Implementing Taskzy was smooth and quick. The customizable, user-friendly interface made team training effortless.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Bilal Ahmed",
    role: "IT Manager, Orion",
  },
  {
    text: "The support team is exceptional — guiding us through setup and providing ongoing assistance every step of the way.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Saman Malik",
    role: "Customer Success Lead",
  },
  {
    text: "Seamless integrations enhanced our entire business stack. Highly recommend for its intuitive interface and reliability.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Omar Raza",
    role: "CEO, Brightline",
  },
  {
    text: "Robust features and quick support have transformed our workflow, making us significantly more efficient as a team.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    name: "Zainab Hussain",
    role: "Project Manager, Vanta",
  },
  {
    text: "Our business functions improved dramatically with a user-friendly design and consistently positive customer feedback.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    name: "Farhan Siddiqui",
    role: "Marketing Director",
  },
  {
    text: "They delivered a solution that exceeded expectations, truly understanding our needs and enhancing our operations.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    name: "Aliza Khan",
    role: "Business Analyst, Nexus",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

export default function Testimonials() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-10"
        >
          <div className="flex justify-center mb-3">
            <span className="border border-border px-4 py-1 rounded-lg text-sm text-muted-foreground font-body">
              Testimonials
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1] text-center">
            Trusted by teams at scale
          </h2>
          <p className="text-center mt-4 text-muted-foreground font-body text-base leading-relaxed">
            See what our customers have to say about Taskzy.
          </p>
        </motion.div>

        {/* Scrolling columns */}
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  )
}
