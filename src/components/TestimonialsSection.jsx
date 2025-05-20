import { useState } from 'react'
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa'

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "I was able to find an Ayurvedic doctor for my chronic condition within minutes. The symptom-based search is incredibly accurate!",
      name: "Sarah J.",
      role: "Patient",
      rating: 5,
      discipline: "Ayurvedic Medicine"
    },
    {
      quote: "As a homeopathic practitioner, this platform has helped me connect with patients who specifically seek alternative treatments. The booking system is seamless.",
      name: "Dr. Michael T.",
      role: "Homeopathic Doctor",
      rating: 5,
      discipline: "Homeopathic Treatment"
    },
    {
      quote: "The advance booking system ensures that patients are committed to their appointments. It has reduced no-shows at our dispensary by over 70%.",
      name: "Dr. Priya S.",
      role: "Western Medicine Specialist",
      rating: 4,
      discipline: "Western Medicine"
    },
    {
      quote: "I love that I can control which notifications I receive. The platform respects my privacy while keeping me informed about important updates.",
      name: "Robert L.",
      role: "Patient",
      rating: 5,
      discipline: "Multiple Disciplines"
    },
    {
      quote: "Managing our multi-doctor dispensary has never been easier. The platform allows us to organize doctors by specialty and manage appointments efficiently.",
      name: "Lisa K.",
      role: "Dispensary Manager",
      rating: 4,
      discipline: "Western Medicine"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  // Display 3 testimonials on desktop, 1 on mobile
  const visibleTestimonials = []
  for (let i = 0; i < 3; i++) {
    visibleTestimonials.push(testimonials[(currentIndex + i) % testimonials.length])
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Doc4All is transforming healthcare experiences for patients and providers alike.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-primary-600 mb-4">
                  <FaQuoteLeft size={24} />
                </div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-primary-600 mt-1">{testimonial.discipline}</p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < testimonial.rating ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view - single testimonial */}
          <div className="md:hidden">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 mb-4">
                <FaQuoteLeft size={24} />
              </div>
              <p className="text-gray-700 mb-6 italic">{testimonials[currentIndex].quote}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{testimonials[currentIndex].name}</p>
                  <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                  <p className="text-xs text-primary-600 mt-1">{testimonials[currentIndex].discipline}</p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < testimonials[currentIndex].rating ? "text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={prevTestimonial}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-primary-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-primary-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection