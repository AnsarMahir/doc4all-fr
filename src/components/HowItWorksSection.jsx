import { FaUserPlus, FaSearch, FaCalendarCheck, FaCreditCard, FaUserMd, FaCommentDots } from 'react-icons/fa'

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FaUserPlus className="text-white text-2xl" />,
      title: "Create an Account",
      description: "Sign up as a patient in just a few minutes with your basic information."
    },
    {
      icon: <FaSearch className="text-white text-2xl" />,
      title: "Search by Nearby Dispensaries",
      description: "Select your preferred medication to find doctors specialized in treating your condition."
    },
    {
      icon: <FaCalendarCheck className="text-white text-2xl" />,
      title: "Book an Appointment",
      description: "Select a convenient time slot from the doctor's available schedule."
    },
    {
      icon: <FaCreditCard className="text-white text-2xl" />,
      title: "Secure Payment",
      description: "Pay a small advance to confirm your booking with our secure payment system."
    },
    {
      icon: <FaUserMd className="text-white text-2xl" />,
      title: "Visit the Doctor",
      description: "Attend your appointment at the scheduled time at the dispensary."
    },
    {
      icon: <FaCommentDots className="text-white text-2xl" />,
      title: "Leave Feedback",
      description: "Share your experience anonymously to help other patients."
    }
  ]

  return (
    <section className="relative py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Getting the healthcare you need is simple with our easy-to-follow process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 h-full hover:bg-white/15 transform hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-500/80 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-bold">Step {index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="opacity-90">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection