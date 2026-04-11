export default function StepCard({ step, title, description, icon }) {
  return (
    <div className="flex gap-5 group">
      {/* Step indicator + connector */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-card group-hover:bg-gold transition-colors duration-300">
          {step}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-navy/20 to-transparent mt-2" />
      </div>
      {/* Content */}
      <div className="pb-8">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-serif font-semibold text-navy text-lg mb-1">{title}</h3>
        <p className="text-sm text-navy/60 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
