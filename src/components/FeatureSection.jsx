import { FaSearch, FaClinicMedical, FaBell, FaUserMd, FaStar, FaCreditCard, FaUserEdit, FaHistory } from 'react-icons/fa'

const FeatureSection = () => {
  const features = [
    {
      icon: <FaSearch className="text-primary-600 text-4xl mb-4" />,
      title: "Symptom-Based Search",
      description: "Find doctors based on your symptoms using our advanced search system."
    },
    {
      icon: <FaClinicMedical className="text-primary-600 text-4xl mb-4" />,
      title: "Multiple Treatment Disciplines",
      description: "Access Homeopathic, Ayurvedic, and Western medicine all in one platform."
    },
    {
      icon: <FaBell className="text-primary-600 text-4xl mb-4" />,
      title: "Smart Notifications",
      description: "Receive important updates from your dispensaries and control which notifications you get."
    },
    {
      icon: <FaUserMd className="text-primary-600 text-4xl mb-4" />,
      title: "Multi-Doctor Dispensaries",
      description: "Dispensaries can have multiple doctors under one discipline for comprehensive care."
    },
    {
      icon: <FaStar className="text-primary-600 text-4xl mb-4" />,
      title: "Anonymous Reviews",
      description: "Share your experience with doctors while maintaining your privacy."
    },
    {
      icon: <FaCreditCard className="text-primary-600 text-4xl mb-4" />,
      title: "Secure Advance Booking",
      description: "Pay a small advance to confirm your appointment with secure payment processing."
    },
    {
      icon: <FaUserEdit className="text-primary-600 text-4xl mb-4" />,
      title: "Account Management",
      description: "Easily register, modify, or delete your patient account as needed."
    },
    {
      icon: <FaHistory className="text-primary-600 text-4xl mb-4" />,
      title: "Booking History",
      description: "Access your complete appointment history and manage upcoming bookings."
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Doc4All offers a comprehensive suite of features designed to make healthcare access simple, efficient, and personalized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection