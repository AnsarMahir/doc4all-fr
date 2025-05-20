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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about using Doc4All for your healthcare needs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full text-left p-4 flex justify-between items-center rounded-lg ${
                  openIndex === index ? 'bg-primary-50 text-primary-700' : 'bg-white hover:bg-gray-50'
                } border border-gray-200 transition-colors duration-200`}
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white border border-t-0 border-gray-200 rounded-b-lg">
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