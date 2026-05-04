export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body">
      {/* Logo */}
      <span className="text-xl font-semibold tracking-tight text-foreground">
        ✦ Taskzy
      </span>

      {/* Nav links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-8">
        {['Home', 'Pricing', 'About', 'Contact'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {/* CTA */}
      <button className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
        Get started
      </button>
    </nav>
  )
}
