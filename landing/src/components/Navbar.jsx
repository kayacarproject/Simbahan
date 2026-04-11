import { useState, useEffect } from 'react'
import { Menu, X, Cross } from 'lucide-react'
import Button from './Button'

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Benefits',     href: '#benefits' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-card' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        >
          <div className="w-8 h-8 bg-navy rounded-xl flex items-center justify-center shadow-card group-hover:bg-navyLight transition-colors">
            <span className="text-gold font-bold text-sm">✦</span>
          </div>
          <span className="font-serif font-bold text-xl text-navy">Simbahan</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => handleNav(href)}
                className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy hover:bg-cream2 rounded-xl transition-all duration-200"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleNav('#cta')}>
            Download App
          </Button>
          <Button variant="accent" size="sm" onClick={() => handleNav('#cta')}>
            Get Started
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-navy hover:bg-cream2 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-cream2 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className="text-left px-4 py-3 text-sm font-medium text-navy hover:bg-cream2 rounded-xl transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="flex gap-3 mt-3 pt-3 border-t border-cream2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleNav('#cta')}>
              Download
            </Button>
            <Button variant="accent" size="sm" className="flex-1" onClick={() => handleNav('#cta')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
