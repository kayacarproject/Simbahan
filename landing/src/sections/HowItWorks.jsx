import StepCard from '../components/StepCard'

const STEPS = [
  {
    step: '1',
    icon: '📲',
    title: 'Download & Register',
    description: 'Install Simbahan on iOS or Android, or open it on the web. Create your account and select your parish in seconds.',
  },
  {
    step: '2',
    icon: '⛪',
    title: 'Connect to Your Parish',
    description: 'Join your parish community. Your Mass schedule, events, and announcements are automatically loaded.',
  },
  {
    step: '3',
    icon: '🙏',
    title: 'Pray, Participate & Give',
    description: 'Follow daily readings, attend events, pray novenas, and donate to parish causes — all from one place.',
  },
  {
    step: '4',
    icon: '👨‍👩‍👧‍👦',
    title: 'Grow in Community',
    description: 'Join ministries, register your family, connect with fellow parishioners, and deepen your faith together.',
  },
]

function AppScreenPreview() {
  return (
    <div className="relative">
      {/* Main screen */}
      <div className="bg-navyDark rounded-3xl p-2 shadow-2xl border border-white/10 w-56 mx-auto">
        <div className="bg-cream rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          <div className="bg-navy px-4 py-3">
            <p className="text-gold text-xs">✦ Simbahan</p>
            <p className="text-white font-serif font-bold text-sm mt-0.5">Mass Schedule</p>
          </div>
          <div className="p-3 space-y-2">
            {[
              { time: '6:00 AM', type: 'Daily Mass', day: 'Mon–Sat' },
              { time: '8:00 AM', type: 'Solemn Mass', day: 'Sunday' },
              { time: '10:00 AM', type: 'Family Mass', day: 'Sunday' },
              { time: '6:00 PM', type: 'Evening Mass', day: 'Daily' },
            ].map(({ time, type, day }) => (
              <div key={time} className="bg-white rounded-xl p-2.5 border border-cream2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-navy">{type}</p>
                  <p className="text-xs text-navy/50">{day}</p>
                </div>
                <span className="text-xs font-medium text-gold bg-goldPale px-2 py-0.5 rounded-full">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card px-3 py-2 border border-cream2 max-w-36">
        <p className="text-xs font-semibold text-navy">🔔 Reminder</p>
        <p className="text-xs text-navy/60 mt-0.5">Mass starts in 30 mins</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sagePale border border-sage/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sage text-sm">✦</span>
            <span className="text-sage text-sm font-medium">Simple to Use</span>
          </div>
          <h2 className="font-serif font-bold text-navy text-4xl sm:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-navy/60 text-lg max-w-xl mx-auto">
            Get started in minutes. No complicated setup — just download, join your parish, and start connecting.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div>
            {STEPS.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>

          {/* Visual */}
          <div className="flex justify-center">
            <AppScreenPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
