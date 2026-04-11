import Button from '../components/Button'

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64 sm:w-72">
      {/* Glow */}
      <div className="absolute inset-0 bg-gold/20 rounded-[3rem] blur-3xl scale-110" />

      {/* Phone frame */}
      <div className="relative bg-navyDark rounded-[2.5rem] p-2 shadow-2xl border border-white/10">
        {/* Screen */}
        <div className="bg-cream rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/19' }}>
          {/* Status bar */}
          <div className="bg-navy px-5 pt-3 pb-2 flex justify-between items-center">
            <span className="text-white/60 text-xs">9:41</span>
            <div className="w-20 h-5 bg-navyDark rounded-full" />
            <div className="flex gap-1">
              <div className="w-3 h-2 bg-white/40 rounded-sm" />
              <div className="w-1 h-2 bg-white/40 rounded-sm" />
            </div>
          </div>

          {/* App header */}
          <div className="bg-navy px-4 pb-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold text-xs font-medium">Magandang Umaga ✦</p>
                <p className="text-white font-serif font-bold text-base">Simbahan</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-xs">🔔</span>
              </div>
            </div>
          </div>

          {/* Next Mass card */}
          <div className="mx-3 -mt-2 bg-white rounded-2xl p-3 shadow-card border border-cream2">
            <p className="text-xs text-navy/50 mb-1">Next Mass</p>
            <p className="font-serif font-bold text-navy text-sm">Sunday Solemn Mass</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gold font-medium">⏰ 8:00 AM</span>
              <span className="text-xs bg-sagePale text-sage px-2 py-0.5 rounded-full">Today</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-3 mt-3">
            <p className="text-xs font-semibold text-navy/50 mb-2 uppercase tracking-wide">Quick Access</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '🕐', label: 'Schedule' },
                { icon: '📅', label: 'Events' },
                { icon: '📖', label: 'Readings' },
                { icon: '💛', label: 'Donate' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-cream2 rounded-xl flex items-center justify-center text-lg">
                    {icon}
                  </div>
                  <span className="text-xs text-navy/60">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement preview */}
          <div className="mx-3 mt-3 bg-goldPale rounded-xl p-3 border border-gold/20">
            <div className="flex items-start gap-2">
              <span className="text-base">📢</span>
              <div>
                <p className="text-xs font-semibold text-navy">Parish Fiesta 2025</p>
                <p className="text-xs text-navy/60 mt-0.5">Join us for the celebration of our patron saint...</p>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-cream2 px-2 py-2 flex justify-around">
            {['🏠', '📅', '🗓', '⋯'].map((icon, i) => (
              <div key={i} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${i === 0 ? 'bg-navy/8 bg-cream2' : ''}`}>
                <span className="text-base">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -left-8 top-16 bg-white rounded-2xl shadow-card px-3 py-2 border border-cream2 flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
        <span className="text-lg">🙏</span>
        <div>
          <p className="text-xs font-semibold text-navy">Daily Readings</p>
          <p className="text-xs text-navy/50">John 3:16</p>
        </div>
      </div>
      <div className="absolute -right-6 bottom-24 bg-white rounded-2xl shadow-card px-3 py-2 border border-cream2 flex items-center gap-2 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <span className="text-lg">✅</span>
        <div>
          <p className="text-xs font-semibold text-navy">RSVP'd</p>
          <p className="text-xs text-navy/50">Parish Fiesta</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative min-h-screen flex items-center bg-hero-pattern overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navyLight to-navy opacity-95" />
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-gold text-sm">✦</span>
              <span className="text-gold text-sm font-medium">Catholic Parish App</span>
            </div>

            <h1 className="font-serif font-bold text-white text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
              Your Parish,{' '}
              <span className="text-gold">In Your</span>{' '}
              Pocket
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Stay connected with your faith community. Mass schedules, events, novenas, donations, and daily readings — all in one beautiful app.
            </p>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 mb-10">
              {[
                { value: '10K+', label: 'Parishioners' },
                { value: '50+',  label: 'Parishes' },
                { value: '4.9★', label: 'App Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-serif font-bold text-2xl">{value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                variant="accent"
                size="lg"
                onClick={() => scrollTo('#cta')}
                icon={<span>📱</span>}
              >
                Download App
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 border border-white/20"
                onClick={() => scrollTo('#features')}
              >
                Explore Features →
              </Button>
            </div>

            {/* Store badges */}
            <div className="flex items-center gap-3 mt-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                <span className="text-xl">🍎</span>
                <div>
                  <p className="text-white/50 text-xs">Download on</p>
                  <p className="text-white text-xs font-semibold">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                <span className="text-xl">▶</span>
                <div>
                  <p className="text-white/50 text-xs">Get it on</p>
                  <p className="text-white text-xs font-semibold">Google Play</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#FAFAF5"/>
        </svg>
      </div>
    </section>
  )
}
