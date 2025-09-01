// src/components/Hero.jsx
const Hero = ({ openAuthModal }) => {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-6 leading-tight">
            Find the right doctor or dispensary near you!
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with healthcare professionals and dispensaries in your area for quick and convenient appointments.
          </p>
          <button 
            onClick={openAuthModal}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
