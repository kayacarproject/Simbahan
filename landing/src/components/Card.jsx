export default function Card({ children, className = '', hover = true }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card border border-cream2 p-6
        ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
