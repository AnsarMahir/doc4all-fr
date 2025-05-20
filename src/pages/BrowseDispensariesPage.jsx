import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaLeaf, FaYinYang, FaHospital, FaStar, FaMapMarkerAlt } from 'react-icons/fa'

// Mock data 
const mockDispensaries = [
  {
    id: 1,
    name: "Wellness Ayurveda Center",
    location: "123 Kahatwoita St, Nittambuwa, WP",
    discipline: "ayurvedic",
    rating: 4.8,
    reviewCount: 124,
    image: "https://images.unsplash.com/photo-1731597076108-f3bbe268162f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    recommended: true,
    featured: true
  },
  {
    id: 2,
    name: "Homeopathic Harmony",
    location: "456 Nawala Way, Colombo, WP",
    discipline: "homeopathic",
    rating: 4.5,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1512867957657-38dbae50a35b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    recommended: true,
    featured: false
  },
  {
    id: 3,
    name: "City Medical Center",
    location: "789 Bogaha Road, Colombo 8, WP",
    discipline: "western",
    rating: 4.7,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    recommended: false,
    featured: true
  },
  // Add more mock dispensaries as needed...
]

const DispensaryCard = ({ dispensary }) => {
  const navigate = useNavigate()
  
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

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={() => navigate(`/dispensary/${dispensary.id}`)}
    >
      <div className="relative h-48">
        <img 
          src={dispensary.image} 
          alt={dispensary.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
          <FaStar className="text-yellow-400 mr-1" />
          {dispensary.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{dispensary.name}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FaMapMarkerAlt className="mr-1" />
          {dispensary.location}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            {getDisciplineIcon(dispensary.discipline)}
            <span className="ml-1">{getDisciplineName(dispensary.discipline)}</span>
          </div>
          <span className="text-sm text-gray-500">{dispensary.reviewCount} reviews</span>
        </div>
      </div>
    </div>
  )
}

const BrowseDispensariesPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search-dispensaries?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const recommendedDispensaries = mockDispensaries.filter(d => d.recommended)
  const nearbyDispensaries = mockDispensaries.slice(0, 4) // In real app, would be based on location
  const ayurvedicDispensaries = mockDispensaries.filter(d => d.discipline === 'ayurvedic')
  const homeopathicDispensaries = mockDispensaries.filter(d => d.discipline === 'homeopathic')
  const westernDispensaries = mockDispensaries.filter(d => d.discipline === 'western')

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for dispensaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-md hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Recommended Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedDispensaries.map(dispensary => (
              <DispensaryCard key={dispensary.id} dispensary={dispensary} />
            ))}
          </div>
        </section>

        {/* Nearby Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Dispensaries Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyDispensaries.map(dispensary => (
              <DispensaryCard key={dispensary.id} dispensary={dispensary} />
            ))}
          </div>
        </section>

        {/* Famous Dispensaries Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Famous Dispensaries</h2>
          
          {/* Ayurvedic */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaLeaf className="text-green-600 mr-2" />
              Ayurvedic Medicine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ayurvedicDispensaries.map(dispensary => (
                <DispensaryCard key={dispensary.id} dispensary={dispensary} />
              ))}
            </div>
          </div>

          {/* Homeopathic */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaYinYang className="text-blue-600 mr-2" />
              Homeopathic Treatment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeopathicDispensaries.map(dispensary => (
                <DispensaryCard key={dispensary.id} dispensary={dispensary} />
              ))}
            </div>
          </div>

          {/* Western */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaHospital className="text-red-600 mr-2" />
              Western Medicine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {westernDispensaries.map(dispensary => (
                <DispensaryCard key={dispensary.id} dispensary={dispensary} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BrowseDispensariesPage