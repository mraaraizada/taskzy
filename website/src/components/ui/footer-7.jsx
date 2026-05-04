import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react'

const defaultSections = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Changelog', href: '#' },
      { name: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Status', href: '#' },
    ],
  },
]

const defaultSocialLinks = [
  { icon: <Instagram className="size-5" />, href: '#', label: 'Instagram' },
  { icon: <Facebook className="size-5" />, href: '#', label: 'Facebook' },
  { icon: <Twitter className="size-5" />, href: '#', label: 'Twitter' },
  { icon: <Linkedin className="size-5" />, href: '#', label: 'LinkedIn' },
]

const defaultLegalLinks = [
  { name: 'Terms and Conditions', href: '#' },
  { name: 'Privacy Policy', href: '#' },
]

export function Footer7({
  logo = {
    url: '#',
    title: '✦ Taskzy',
  },
  sections = defaultSections,
  description = 'Intelligent automation for modern teams. Move faster, work smarter, and focus on what matters.',
  socialLinks = defaultSocialLinks,
  copyright = '© 2026 Taskzy, Inc. All rights reserved.',
  legalLinks = defaultLegalLinks,
}) {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start">
          {/* Brand */}
          <div className="flex w-full flex-col justify-between gap-6 lg:max-w-xs lg:items-start">
            <a href={logo.url} className="text-xl font-semibold tracking-tight text-foreground font-body">
              {logo.title}
            </a>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {description}
            </p>
            <ul className="flex items-center gap-3 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li key={idx}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:text-foreground hover:border-foreground/20 transition-colors"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid w-full gap-8 grid-cols-2 md:grid-cols-3 lg:gap-16">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 text-xs font-semibold text-foreground font-body uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground font-body hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center">
          <p className="order-2 md:order-1 font-body">{copyright}</p>
          <ul className="order-1 md:order-2 flex flex-wrap gap-4">
            {legalLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.href} className="font-body hover:text-foreground transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
