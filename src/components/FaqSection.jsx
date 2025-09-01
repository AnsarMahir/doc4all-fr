import { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const FaqSection = () => {
  const faqs = [
    {
      question: "How do I search for doctors based on my symptoms?",
      answer: "Our platform allows you to enter your symptoms in the search bar. Our advanced algorithm will match your symptoms with doctors who specialize in treating those conditions. You can further filter results by treatment discipline, location, and availability."
    },
    {
      question: "What treatment disciplines are available on Doc4All?",
      answer: "Doc4All currently offers three main treatment disciplines: Ayurvedic Medicine, Homeopathic Treatment, and Western (Conventional) Medicine. Each dispensary and its doctors operate under one of these disciplines."
    },
    {
      question: "How does the advance booking payment work?",
      answer: "When you book an appointment, you'll be required to pay a small percentage of the doctor's consultation fee as an advance. This confirms your booking and reduces no-shows. The remaining amount is paid directly at the dispensary during your visit."
    },
    {
      question: "Can I control which notifications I receive?",
      answer: "Yes, you have full control over your notification preferences. In your account settings, you can choose which dispensaries can send you notifications and what types of notifications you want to receive (appointment reminders, promotional offers, health tips, etc.)."
    },
    {
      question: "How do I leave a review for a doctor?",
      answer: "After your appointment, you'll receive a notification inviting you to leave feedback. Your review will be published anonymously to protect your privacy while helping other patients make informed decisions."
    },
    {
      question: "Can dispensaries have multiple doctors?",
      answer: "Yes, dispensaries can register multiple doctors under their profile. However, all doctors within a single dispensary must practice the same treatment discipline (Ayurvedic, Homeopathic, or Western)."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account by going to Account Settings and selecting 'Delete Account'. Please note that while your personal information will be removed, your anonymous reviews will remain on the platform."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment gateways to process all transactions. We never store your complete credit card information on our servers."
    }
  ]

  const [openIndex, setOpenIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-16 bg-gradient-to-br from-white via-primary-50 to-primary-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about using Doc4All for your healthcare needs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full text-left p-4 flex justify-between items-center rounded-lg ${
                  openIndex === index ? 'bg-primary-50/80 text-primary-700 shadow-lg' : 'bg-white/80 hover:bg-primary-50/50'
                } backdrop-blur-sm border border-primary-100 transition-all duration-300 hover:shadow-md`}
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                {openIndex === index ? <FaChevronUp className="text-primary-600" /> : <FaChevronDown className="text-primary-600" />}
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white/80 backdrop-blur-sm border border-t-0 border-primary-100 rounded-b-lg shadow-lg">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FaqSection