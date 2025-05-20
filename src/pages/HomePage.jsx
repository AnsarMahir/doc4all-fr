import Hero from '../components/Hero'
import FeatureSection from '../components/FeatureSection'
import DisciplinesSection from '../components/DisciplinesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import TestimonialsSection from '../components/TestimonialsSection'
import FaqSection from '../components/FaqSection'

const HomePage = ({ openRegistrationModal }) => {
  return (
    <>
      <Hero openRegistrationModal={openRegistrationModal} />
      <FeatureSection />
      <DisciplinesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  )
}

export default HomePage