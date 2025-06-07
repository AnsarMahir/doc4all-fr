// src/components/Hero.jsx
const Hero = ({ openAuthModal }) => {
  return (
    <section className="hero-image py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find the right doctor or dispensary near you!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Connect with healthcare professionals and dispensaries in your area for quick and convenient appointments.
          </p>
          <button 
            onClick={openAuthModal}
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
