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
    <section className="relative py-16 bg-gradient-to-tr from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how Doc4All is transforming healthcare experiences for patients and providers alike.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-primary-100">
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
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-primary-100">
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
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all duration-300 border border-primary-100"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-primary-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all duration-300 border border-primary-100"
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