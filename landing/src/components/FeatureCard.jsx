import Card from './Card'

export default function FeatureCard({ icon, title, description, accent = false }) {
  return (
    <Card className={accent ? 'border-gold/30 bg-goldPale/30' : ''}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl
        ${accent ? 'bg-gold/20' : 'bg-navy/8 bg-cream2'}`}
      >
        {icon}
      </div>
      <h3 className="font-serif font-semibold text-navy text-lg mb-2">{title}</h3>
      <p className="text-sm text-navy/60 leading-relaxed">{description}</p>
    </Card>
  )
}
