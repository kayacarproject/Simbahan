import Card from './Card'

export default function TestimonialCard({ quote, name, role, avatar, rating = 5 }) {
  return (
    <Card className="flex flex-col gap-4">
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-gold text-sm">★</span>
        ))}
      </div>
      <p className="text-navy/70 text-sm leading-relaxed italic flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-cream2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navyLight flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {avatar || name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">{name}</p>
          <p className="text-xs text-navy/50">{role}</p>
        </div>
      </div>
    </Card>
  )
}
