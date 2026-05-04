import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TechStack from './components/TechStack'
import Services from './components/Services'
import WhyChooseUs from './components/WhyChooseUs'
import Testimonials from './components/Testimonials'
import Stats from './components/Stats'
import Pricing from './components/Pricing'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero — full viewport height */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <Hero />
      </div>

      {/* Scrollable sections below */}
      <Services />
      <WhyChooseUs />
      <TechStack />
      <Testimonials />
      <Stats />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
