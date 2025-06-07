import Hero from '../components/Hero'
import FeatureSection from '../components/FeatureSection'
import DisciplinesSection from '../components/DisciplinesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import TestimonialsSection from '../components/TestimonialsSection'
import FaqSection from '../components/FaqSection'

const HomePage = ({ openAuthModal }) => {
  return (
    <>
      <Hero openAuthModal={openAuthModal} />
      <FeatureSection />
      <DisciplinesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  )
}

export default HomePage