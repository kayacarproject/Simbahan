import TestimonialCard from '../components/TestimonialCard'

const TESTIMONIALS = [
  {
    quote: 'Simbahan has completely changed how I stay connected with our parish. I never miss a Mass schedule or announcement anymore. It\'s like having the church in my pocket!',
    name: 'Maria Santos',
    role: 'Parishioner, Sto. Niño Parish',
    rating: 5,
  },
  {
    quote: 'As a parish secretary, managing announcements and events used to take hours. With Simbahan, I can update everything in minutes and reach all our parishioners instantly.',
    name: 'Fr. Jose Reyes',
    role: 'Parish Priest, San Isidro Parish',
    rating: 5,
  },
  {
    quote: 'The novena guide and daily readings feature is beautiful. My whole family uses it every morning for our prayer time. The rosary guide is especially helpful for the kids.',
    name: 'Ana Dela Cruz',
    role: 'Ministry Leader, BEC Coordinator',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sagePale border border-sage/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sage text-sm">✦</span>
            <span className="text-sage text-sm font-medium">Community Voices</span>
          </div>
          <h2 className="font-serif font-bold text-navy text-4xl sm:text-5xl mb-4">
            What Parishioners Say
          </h2>
          <p className="text-navy/60 text-lg max-w-xl mx-auto">
            Thousands of faithful Filipinos trust Simbahan to keep them connected with their parish.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>

        {/* App store rating */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-card border border-cream2">
            <span className="text-3xl">🍎</span>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-gold text-sm">★</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-navy">4.9 on App Store</p>
              <p className="text-xs text-navy/50">2,400+ ratings</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-card border border-cream2">
            <span className="text-3xl">▶</span>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-gold text-sm">★</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-navy">4.8 on Google Play</p>
              <p className="text-xs text-navy/50">3,100+ ratings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
