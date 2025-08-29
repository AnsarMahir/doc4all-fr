import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaSearch, FaLeaf, FaYinYang, FaHospital, FaStar, FaMapMarkerAlt, FaFilter, FaMosque } from 'react-icons/fa'
import { API_CONFIG, buildUrl } from '../config/api'
import { useApi } from '../hooks/useApi'

// Mock images for dispensaries (since we don't provide images)
const getDispensaryImage = (type) => {
  const images = {
    Ayurvedic: "https://images.unsplash.com/photo-1731597076108-f3bbe268162f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    Homeopathy: "https://images.unsplash.com/photo-1512867957657-38dbae50a35b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    Western: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    Unani: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
  }
  return images[type] || images.Western
}

const SearchDispensariesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { get } = useApi()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [dispensaries, setDispensaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const treatmentTypes = [
    { id: 'Ayurvedic', name: 'Ayurvedic Medicine', icon: <FaLeaf className="text-green-600" /> },
    { id: 'Homeopathy', name: 'Homeopathic Treatment', icon: <FaYinYang className="text-blue-600" /> },
    { id: 'Western', name: 'Western Medicine', icon: <FaHospital className="text-red-600" /> },
    { id: 'Unani', name: 'Unani Medicine', icon: <FaMosque className="text-purple-600" /> }
  ]

  // Fetch dispensaries from API
  useEffect(() => {
    const fetchDispensaries = async () => {
      try {
        setLoading(true)
        const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.DISPENSARIES))
        setDispensaries(response || [])
      } catch (err) {
        setError('Failed to fetch dispensaries')
        console.error('Error fetching dispensaries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDispensaries()
  }, []) // Remove get from dependency array

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const toggleType = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(d => d !== typeId)
        : [...prev, typeId]
    )
  }

  const handleViewDetails = (dispensaryId) => {
    navigate(`/dispensary/${dispensaryId}`)
  }

  const filterDispensaries = () => {
    let results = [...dispensaries]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(d => 
        d.name.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)) ||
        d.address.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query)
      )
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      results = results.filter(d => selectedTypes.includes(d.type))
    }

    // Sort results
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'type':
        results.sort((a, b) => a.type.localeCompare(b.type))
        break
      case 'rating':
        results.sort((a, b) => {
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          return ratingB - ratingA // Highest rating first
        })
        break
      default:
        // Keep original order for relevance
        break
    }

    return results
  }

  const filteredDispensaries = filterDispensaries()

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dispensaries...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
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

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  className="md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
                {/* Treatment Types */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Treatment Type</h3>
                  {treatmentTypes.map(type => (
                    <label
                      key={type.id}
                      className="flex items-center space-x-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => toggleType(type.id)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.name}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-medium mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="rating">Rating (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-grow">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {filteredDispensaries.length} Results Found
              </h2>
            </div>

            <div className="space-y-4">
              {filteredDispensaries.map(dispensary => (
                <div
                  key={dispensary.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex"
                >
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src={getDispensaryImage(dispensary.type)}
                      alt={dispensary.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{dispensary.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FaMapMarkerAlt className="mr-1" />
                          {dispensary.address}
                        </div>
                        {dispensary.phoneNumber && (
                          <div className="text-sm text-gray-600 mb-2">
                            Phone: {dispensary.phoneNumber}
                          </div>
                        )}
                        {dispensary.email && (
                          <div className="text-sm text-gray-600 mb-2">
                            Email: {dispensary.email}
                          </div>
                        )}
                      </div>
                      {/* Rating Display */}
                      {dispensary.rating && (
                        <div className="flex items-center">
                          <div className="flex items-center mr-2">
                            <FaStar className="text-yellow-400" />
                            <span className="ml-1 font-medium">{dispensary.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {dispensary.description && (
                      <p className="text-gray-600 mb-4">{dispensary.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {treatmentTypes.find(t => t.id === dispensary.type)?.icon}
                        <span className="ml-2 text-sm">
                          {treatmentTypes.find(t => t.id === dispensary.type)?.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleViewDetails(dispensary.id)}
                        className="btn-primary"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredDispensaries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No dispensaries found matching your criteria.</p>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDispensariesPage