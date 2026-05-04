import React from 'react'
import { motion } from 'motion/react'

export const TestimonialsColumn = ({ className, testimonials, duration }) => {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration: duration || 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-8 rounded-3xl border border-border shadow-lg shadow-primary/5 max-w-xs w-full bg-background"
                key={i}
              >
                <p className="text-sm text-muted-foreground font-body leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-foreground font-body leading-5">{name}</div>
                    <div className="text-xs text-muted-foreground font-body leading-5">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}
