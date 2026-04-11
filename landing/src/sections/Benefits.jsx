import Card from '../components/Card'

const BENEFITS = [
  {
    icon: '⚡',
    title: 'Saves Time',
    description: 'No more searching for Mass schedules or event flyers. Everything is updated in real time.',
  },
  {
    icon: '📱',
    title: 'Easy to Use',
    description: 'Intuitive design that works for all ages. From lola to millennials — everyone can navigate it.',
  },
  {
    icon: '✅',
    title: 'Accurate & Reliable',
    description: 'Parish-verified information. Get the right schedule, the right readings, every time.',
  },
  {
    icon: '🌐',
    title: 'Works Everywhere',
    description: 'Mobile, tablet, and web. Access your parish from anywhere, anytime.',
  },
  {
    icon: '🔔',
    title: 'Never Miss a Thing',
    description: 'Push notifications for Mass reminders, event alerts, and urgent announcements.',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure',
    description: 'Your data is protected. Donations are processed through trusted payment gateways.',
  },
]

export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-goldPale border border-gold/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-gold text-sm">✦</span>
            <span className="text-gold text-sm font-medium">Why Choose Simbahan</span>
          </div>
          <h2 className="font-serif font-bold text-navy text-4xl sm:text-5xl mb-4">
            Built for the Filipino<br />Catholic Community
          </h2>
          <p className="text-navy/60 text-lg max-w-2xl mx-auto">
            Designed with love for our parishes. Every feature is crafted to help you stay connected with your faith and community.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {BENEFITS.map(({ icon, title, description }) => (
            <Card key={title}>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-serif font-semibold text-navy text-lg mb-2">{title}</h3>
              <p className="text-sm text-navy/60 leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>

        {/* Stats banner */}
        <div className="bg-gradient-to-br from-navy to-navyLight rounded-3xl p-8 sm:p-12 text-center shadow-glow">
          <p className="text-gold font-medium text-sm mb-4">Trusted by Parishes Nationwide</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: '10,000+', label: 'Active Users' },
              { value: '50+',    label: 'Partner Parishes' },
              { value: '₱2M+',   label: 'Donations Processed' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-serif font-bold text-4xl sm:text-5xl mb-1">{value}</p>
                <p className="text-white/60 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
