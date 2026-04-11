/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#1A2B5E',
        navyLight: '#2A3F7E',
        navyDark: '#0F1A3A',
        gold: '#C9922A',
        goldLight: '#E0B050',
        goldPale: '#F5E6C8',
        crimson: '#9B1D20',
        crimsonLight: '#C0393D',
        crimsonPale: '#F5E0E0',
        sage: '#2D6A4F',
        sagePale: '#D8EDE4',
        cream: '#FAFAF5',
        cream2: '#F0EFE8',
        border: '#E5E5E0',
        // Semantic aliases used by theme.ts consumers (announcements, schedule, parish, AnnouncementCard)
        primary: '#1A2B5E',    // = navy
        accent: '#C9922A',     // = gold
        background: '#FAFAF5', // = cream
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_700Bold'],
        playfairMd: ['PlayfairDisplay_600SemiBold'],
        sans: ['DMSans_400Regular'],
        sansMd: ['DMSans_500Medium'],
      },
    },
  },
  plugins: [],
};
