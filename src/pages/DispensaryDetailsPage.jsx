import { useParams } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaGlobe, FaStar, FaLeaf, FaYinYang, FaHospital, FaCalendar, FaClock, FaUserMd } from 'react-icons/fa'

// Mock data for dispensaries with comprehensive details
const mockDispensaries = [
  {
    id: 1,
    name: "Wellness Ayurveda Center",
    location: "123 Kahatwoita St, Nittambuwa, WP",
    discipline: "ayurvedic",
    rating: 4.8,
    reviewCount: 124,
    mainImage: "https://images.pexels.com/photos/3735215/pexels-photo-3735215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    galleryImages: [
      "https://images.pexels.com/photos/3735217/pexels-photo-3735217.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3735220/pexels-photo-3735220.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3735225/pexels-photo-3735225.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Specializing in traditional Ayurvedic treatments with modern amenities. Our center combines ancient wisdom with contemporary healthcare practices to provide holistic healing experiences.",
    phone: "+1 (415) 555-1234",
    website: "https://wellness-ayurveda.example.com",
    email: "info@wellness-ayurveda.example.com",
    openingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 4:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    facilities: [
      {
        name: "Panchakarma Treatment Rooms",
        description: "Specialized rooms for traditional cleansing therapies"
      },
      {
        name: "Meditation Hall",
        description: "Peaceful space for guided meditation sessions"
      },
      {
        name: "Herbal Medicine Dispensary",
        description: "Custom-prepared Ayurvedic medicines and supplements"
      },
      {
        name: "Consultation Rooms",
        description: "Private rooms for one-on-one consultations"
      },
      {
        name: "Yoga Studio",
        description: "Fully equipped studio for therapeutic yoga sessions"
      }
    ],
    doctors: [
      {
        id: 1,
        name: "Dr. Rafath Zanar",
        specialization: "Ayurvedic Medicine",
        experience: "15 years",
        image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300",
        rating: 4.9,
        reviewCount: 89,
        availability: "Mon-Fri, 9:00 AM - 5:00 PM",
        education: [
          "BAMS - Kelani University",
          "MD Ayurveda - Gampaha Wickramarachchi University"
        ],
        specialties: [
          "Panchakarma",
          "Respiratory Disorders",
          "Joint Pain Management"
        ],
        languages: ["English", "Hindi", "Gujarati"],
        reviews: [
          {
            id: 1,
            rating: 5,
            comment: "Dr. Zanars's treatment helped me recover from chronic back pain. His approach is very thorough and patient-centered.",
            author: "John D.",
            date: "2024-02-15"
          },
          {
            id: 2,
            rating: 5,
            comment: "Excellent doctor with deep knowledge of Ayurvedic principles. Highly recommended!",
            author: "Sarah M.",
            date: "2024-02-10"
          }
        ]
      },
      {
        id: 2,
        name: "Dr. Thooba Banu",
        specialization: "Ayurvedic Specialist",
        experience: "12 years",
        image: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=300",
        rating: 4.7,
        reviewCount: 65,
        availability: "Mon-Sat, 10:00 AM - 6:00 PM",
        education: [
          "BAMS - Colombo University",
          "PG Diploma in Panchakarma"
        ],
        specialties: [
          "Panchakarma Therapy",
          "Skin Disorders",
          "Stress Management"
        ],
        languages: ["English", "Hindi", "Marathi"],
        reviews: [
          {
            id: 3,
            rating: 5,
            comment: "Dr. Banu's panchakarma treatment was transformative. Very professional and caring approach.",
            author: "Michael R.",
            date: "2024-02-12"
          },
          {
            id: 4,
            rating: 4,
            comment: "Great experience with skin treatment. Saw significant improvement in 3 months.",
            author: "Lisa K.",
            date: "2024-02-05"
          }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        rating: 5,
        comment: "Excellent facility with a calm and healing atmosphere. The staff is very knowledgeable and caring.",
        author: "Robert M.",
        date: "2024-02-18"
      },
      {
        id: 2,
        rating: 4,
        comment: "Great experience with their panchakarma treatment. Very professional service.",
        author: "Emily S.",
        date: "2024-02-16"
      },
      {
        id: 3,
        rating: 5,
        comment: "The herbal medicines prescribed worked wonders for my digestive issues.",
        author: "David L.",
        date: "2024-02-14"
      }
    ]
  },
  // Add more dispensaries with similar detailed structure...
]

const getDisciplineIcon = (discipline) => {
  switch (discipline) {
    case 'ayurvedic':
      return <FaLeaf className="text-green-600" />
    case 'homeopathic':
      return <FaYinYang className="text-blue-600" />
    case 'western':
      return <FaHospital className="text-red-600" />
    default:
      return null
  }
}

const getDisciplineName = (discipline) => {
  switch (discipline) {
    case 'ayurvedic':
      return 'Ayurvedic Medicine'
    case 'homeopathic':
      return 'Homeopathic Treatment'
    case 'western':
      return 'Western Medicine'
    default:
      return 'Unknown'
  }
}

const DispensaryDetailsPage = () => {
  const { id } = useParams()
  const dispensary = mockDispensaries.find(d => d.id === parseInt(id))

  if (!dispensary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Dispensary not found</h2>
          <p className="mt-2 text-gray-600">The dispensary you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Main Image and Basic Info */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-96">
            <img 
              src={dispensary.mainImage} 
              alt={dispensary.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h1 className="text-4xl font-bold text-white mb-2">{dispensary.name}</h1>
              <div className="flex items-center text-white">
                <FaMapMarkerAlt className="mr-2" />
                {dispensary.location}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dispensary.galleryImages.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={`${dispensary.name} - Gallery ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {getDisciplineIcon(dispensary.discipline)}
              <span className="ml-2 text-xl">{getDisciplineName(dispensary.discipline)}</span>
            </div>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                <FaStar />
                <span className="ml-1 font-medium">{dispensary.rating}</span>
              </div>
              <span className="text-gray-500 ml-2">({dispensary.reviewCount} reviews)</span>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{dispensary.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaPhone className="text-gray-500 mr-2" />
                  <a href={`tel:${dispensary.phone}`} className="text-primary-600 hover:text-primary-700">
                    {dispensary.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <FaGlobe className="text-gray-500 mr-2" />
                  <a 
                    href={dispensary.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Opening Hours</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(dispensary.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}:</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Facilities & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dispensary.facilities.map((facility, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h3 className="font-semibold mb-2">{facility.name}</h3>
                <p className="text-gray-600 text-sm">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Our Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dispensary.doctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
                    <p className="text-primary-600 font-medium mb-2">{doctor.specialization}</p>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        <FaStar />
                        <span className="ml-1 font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm ml-2">({doctor.reviewCount} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <FaUserMd className="text-gray-500 mr-2" />
                        <span>{doctor.experience} of experience</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaClock className="text-gray-500 mr-2" />
                        <span>{doctor.availability}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Education</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {doctor.education.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {doctor.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="btn-primary w-full">
                      Book Appointment
                    </button>
                  </div>
                </div>

                {/* Doctor Reviews */}
                <div className="border-t border-gray-200 p-6">
                  <h4 className="font-medium mb-4">Recent Reviews</h4>
                  <div className="space-y-4">
                    {doctor.reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                        <p className="text-sm text-gray-500">- {review.author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispensary Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            Reviews
            <span className="text-gray-500 text-lg ml-2">
              ({dispensary.reviews.length})
            </span>
          </h2>
          <div className="space-y-6">
            {dispensary.reviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                <p className="text-sm text-gray-500">- {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryDetailsPage