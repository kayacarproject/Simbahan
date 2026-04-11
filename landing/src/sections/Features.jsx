import FeatureCard from '../components/FeatureCard'

const FEATURES = [
  {
    icon: '🕐',
    title: 'Mass Schedule',
    description: 'View daily, weekly, and special Mass schedules. Filter by type and get celebrant info. Never miss a Mass again.',
    accent: false,
  },
  {
    icon: '📅',
    title: 'Events & Feasts',
    description: 'Browse parish events, feast days, and programs. RSVP with one tap and share with family.',
    accent: false,
  },
  {
    icon: '📖',
    title: 'Daily Readings',
    description: 'Today\'s liturgical readings — First Reading, Psalm, Gospel — with liturgical calendar color indicators.',
    accent: true,
  },
  {
    icon: '🙏',
    title: 'Novenas & Rosary',
    description: 'Guided novenas with day-by-day prayers and a full interactive Rosary with mystery selector.',
    accent: false,
  },
  {
    icon: '💛',
    title: 'Online Donations',
    description: 'Give to parish causes via GCash, PayMaya, or card. Track your giving history and download receipts.',
    accent: false,
  },
  {
    icon: '⛪',
    title: 'Sacrament Requests',
    description: 'Request Baptism, Confirmation, Marriage, and more online. Track your request status in real time.',
    accent: false,
  },
  {
    icon: '📢',
    title: 'Announcements',
    description: 'Stay updated with parish news, urgent notices, and liturgical announcements. Bookmark what matters.',
    accent: false,
  },
  {
    icon: '👥',
    title: 'Community',
    description: 'Connect with fellow parishioners, join ministries, register as a volunteer, and manage your family records.',
    accent: false,
  },
  {
    icon: '🎥',
    title: 'Live & Media',
    description: 'Watch live-streamed Masses, browse the homily video archive, and listen to prayer audio anytime.',
    accent: true,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-goldPale border border-gold/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-gold text-sm">✦</span>
            <span className="text-gold text-sm font-medium">Everything You Need</span>
          </div>
          <h2 className="font-serif font-bold text-navy text-4xl sm:text-5xl mb-4">
            All of Parish Life,<br />One App
          </h2>
          <p className="text-navy/60 text-lg max-w-xl mx-auto">
            From daily prayers to community events — Simbahan brings your entire parish experience to your fingertips.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
