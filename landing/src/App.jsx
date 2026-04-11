import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import Features from './sections/Features'
import HowItWorks from './sections/HowItWorks'
import Screenshots from './sections/Screenshots'
import Benefits from './sections/Benefits'
import Testimonials from './sections/Testimonials'
import CTA from './sections/CTA'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Benefits />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
