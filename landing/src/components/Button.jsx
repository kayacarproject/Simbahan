const variants = {
  primary: 'bg-navy text-white hover:bg-navyLight shadow-card',
  accent:  'bg-gold text-white hover:bg-goldLight shadow-glow',
  outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-white',
  ghost:   'text-navy hover:bg-cream2',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-2xl
        transition-all duration-200 cursor-pointer select-none
        focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
        active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
