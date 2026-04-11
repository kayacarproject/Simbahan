const LINKS = {
  Product: ['Features', 'How It Works', 'Download', 'Changelog'],
  Parish:  ['Mass Schedule', 'Events', 'Donations', 'Novenas'],
  Company: ['About', 'Contact', 'Privacy Policy', 'Terms of Use'],
}

function SocialIcon({ label, children }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gold/20 flex items-center justify-center text-white/70 hover:text-gold transition-all duration-200"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navyDark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
                <span className="text-gold font-bold">✦</span>
              </div>
              <span className="font-serif font-bold text-xl">Simbahan</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Your parish, in your pocket. Connecting the faithful with their community through technology and faith.
            </p>
            {/* Social */}
            <div className="flex gap-2 mt-6">
              <SocialIcon label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </SocialIcon>
              <SocialIcon label="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </SocialIcon>
              <SocialIcon label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                  <polygon fill="#0F1A3A" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">{heading}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/50 hover:text-gold transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Simbahan. All rights reserved.
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            Made with <span className="text-crimson">♥</span> for the Filipino Catholic community
          </p>
        </div>
      </div>
    </footer>
  )
}
