import Button from '../components/Button'

function StoreButton({ platform, icon, store, href = '#' }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-5 py-3.5 transition-all duration-200 group"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-white/60 text-xs">{store}</p>
        <p className="text-white font-semibold text-sm group-hover:text-gold transition-colors">{platform}</p>
      </div>
    </a>
  )
}

export default function CTA() {
  return (
    <section id="cta" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-navy via-navyLight to-navyDark rounded-3xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-crimson/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />

          <div className="relative px-8 sm:px-12 lg:px-16 py-16 sm:py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-gold text-sm">✦</span>
              <span className="text-gold text-sm font-medium">Free to Download</span>
            </div>

            <h2 className="font-serif font-bold text-white text-4xl sm:text-5xl lg:text-6xl mb-6 text-balance">
              Start Your Journey<br />with Your Parish Today
            </h2>

            <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Join thousands of Filipino Catholics who have already brought their parish life into their pocket. Download Simbahan for free.
            </p>

            {/* Store buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <StoreButton platform="App Store" icon="🍎" store="Download on the" />
              <StoreButton platform="Google Play" icon="▶" store="Get it on" />
              <StoreButton platform="Web App" icon="🌐" store="Open in browser" />
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-sage">✓</span> Free forever for parishioners
              </span>
              <span className="hidden sm:block">·</span>
              <span className="flex items-center gap-2">
                <span className="text-sage">✓</span> No ads, no spam
              </span>
              <span className="hidden sm:block">·</span>
              <span className="flex items-center gap-2">
                <span className="text-sage">✓</span> Works offline
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
