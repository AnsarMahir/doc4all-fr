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
      title: "Search by Symptoms",
      description: "Enter your symptoms to find doctors specialized in treating your condition."
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
    <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Getting the healthcare you need is simple with our easy-to-follow process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm border border-white border-opacity-20 h-full">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-700 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg">
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