import { useState } from 'react'

const SCREENS = [
  {
    id: 'home',
    label: 'Home',
    color: 'from-navy to-navyLight',
    content: (
      <div className="p-3 space-y-2">
        <div className="bg-white/10 rounded-xl p-2.5">
          <p className="text-gold text-xs font-medium">Next Mass</p>
          <p className="text-white font-serif font-bold text-sm">Sunday Solemn Mass</p>
          <p className="text-white/60 text-xs mt-1">⏰ 8:00 AM · Today</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {['🕐', '📅', '📖', '💛'].map((icon, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-2 flex flex-col items-center gap-1">
              <span className="text-base">{icon}</span>
            </div>
          ))}
        </div>
        <div className="bg-gold/20 rounded-xl p-2.5 border border-gold/30">
          <p className="text-gold text-xs font-semibold">📢 Parish Fiesta 2025</p>
          <p className="text-white/70 text-xs mt-0.5">Join us for the celebration...</p>
        </div>
      </div>
    ),
  },
  {
    id: 'readings',
    label: 'Readings',
    color: 'from-sage to-green-700',
    content: (
      <div className="p-3 space-y-2">
        <div className="bg-white/10 rounded-xl p-2.5">
          <p className="text-white/50 text-xs">First Reading</p>
          <p className="text-white font-serif font-semibold text-xs mt-1">Isaiah 55:10-11</p>
          <p className="text-white/60 text-xs mt-1 leading-relaxed">For just as from the heavens the rain and snow come down...</p>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5">
          <p className="text-white/50 text-xs">Gospel</p>
          <p className="text-white font-serif font-semibold text-xs mt-1">Matthew 13:1-23</p>
          <p className="text-white/60 text-xs mt-1 leading-relaxed">On that day, Jesus went out of the house and sat down by the sea...</p>
        </div>
      </div>
    ),
  },
  {
    id: 'donations',
    label: 'Donations',
    color: 'from-gold to-yellow-600',
    content: (
      <div className="p-3 space-y-2">
        {[
          { name: 'Parish Building Fund', pct: 68 },
          { name: 'Scholars Program', pct: 45 },
          { name: 'Calamity Relief', pct: 82 },
        ].map(({ name, pct }) => (
          <div key={name} className="bg-white/15 rounded-xl p-2.5">
            <p className="text-white text-xs font-semibold">{name}</p>
            <div className="mt-1.5 bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-white/70 text-xs mt-1">{pct}% funded</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'novenas',
    label: 'Novenas',
    color: 'from-crimson to-red-800',
    content: (
      <div className="p-3 space-y-2">
        <p className="text-white/60 text-xs uppercase tracking-wide">Active Novena</p>
        <div className="bg-white/10 rounded-xl p-2.5">
          <p className="text-white font-serif font-bold text-sm">Novena to Our Lady</p>
          <p className="text-white/60 text-xs mt-1">Day 5 of 9</p>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${i < 5 ? 'bg-gold' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5">
          <p className="text-white/50 text-xs">Today's Prayer</p>
          <p className="text-white text-xs mt-1 leading-relaxed italic">O Most Holy Virgin Mary, Queen of all hearts...</p>
        </div>
      </div>
    ),
  },
]

export default function Screenshots() {
  const [active, setActive] = useState(0)

  return (
    <section id="screenshots" className="py-24 bg-cream2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-navy/8 bg-cream border border-navy/10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-navy text-sm">✦</span>
            <span className="text-navy text-sm font-medium">App Preview</span>
          </div>
          <h2 className="font-serif font-bold text-navy text-4xl sm:text-5xl mb-4">
            See It in Action
          </h2>
          <p className="text-navy/60 text-lg max-w-xl mx-auto">
            A beautifully designed app that feels as sacred as the faith it serves.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {SCREENS.map((screen, i) => (
            <button
              key={screen.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === i
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-navy/60 hover:text-navy border border-cream2'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>

        {/* Screens grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
          {SCREENS.map((screen, i) => (
            <div
              key={screen.id}
              onClick={() => setActive(i)}
              className={`cursor-pointer transition-all duration-300 ${
                active === i ? 'scale-105' : 'scale-95 opacity-60 hover:opacity-80'
              }`}
            >
              <div className="bg-navyDark rounded-3xl p-1.5 shadow-xl border border-white/10 w-36 sm:w-44">
                <div
                  className={`bg-gradient-to-b ${screen.color} rounded-2xl overflow-hidden`}
                  style={{ aspectRatio: '9/16' }}
                >
                  {/* Mini status bar */}
                  <div className="px-3 pt-2 pb-1 flex justify-between">
                    <span className="text-white/40 text-xs">9:41</span>
                    <div className="w-10 h-3 bg-black/30 rounded-full" />
                  </div>
                  {screen.content}
                </div>
              </div>
              <p className={`text-center text-xs font-medium mt-2 transition-colors ${
                active === i ? 'text-navy' : 'text-navy/40'
              }`}>
                {screen.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
