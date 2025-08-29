import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaSearch, FaLeaf, FaYinYang, FaHospital, FaStar, FaMapMarkerAlt, FaFilter } from 'react-icons/fa'

// Using the same mock data as BrowseDispensariesPage
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

const SearchDispensariesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedDisciplines, setSelectedDisciplines] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  const disciplines = [
    { id: 'ayurvedic', name: 'Ayurvedic Medicine', icon: <FaLeaf className="text-green-600" /> },
    { id: 'homeopathic', name: 'Homeopathic Treatment', icon: <FaYinYang className="text-blue-600" /> },
    { id: 'western', name: 'Western Medicine', icon: <FaHospital className="text-red-600" /> }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: searchQuery })
  }

  const toggleDiscipline = (disciplineId) => {
    setSelectedDisciplines(prev => 
      prev.includes(disciplineId)
        ? prev.filter(d => d !== disciplineId)
        : [...prev, disciplineId]
    )
  }

  const filterDispensaries = () => {
    let results = [...mockDispensaries]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(d => 
        d.name.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)) ||
        d.location.toLowerCase().includes(query)
      )
    }

    // Filter by selected disciplines
    if (selectedDisciplines.length > 0) {
      results = results.filter(d => selectedDisciplines.includes(d.discipline))
    }

    // Filter by minimum rating
    if (minRating > 0) {
      results = results.filter(d => d.rating >= minRating)
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        results.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      // Add more sorting options as needed
    }

    return results
  }

  const filteredDispensaries = filterDispensaries()

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
                {/* Treatment Disciplines */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Treatment Discipline</h3>
                  {disciplines.map(discipline => (
                    <label
                      key={discipline.id}
                      className="flex items-center space-x-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDisciplines.includes(discipline.id)}
                        onChange={() => toggleDiscipline(discipline.id)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex items-center">
                        {discipline.icon}
                        <span className="ml-2">{discipline.name}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* Minimum Rating */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Minimum Rating</h3>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Any</span>
                    <span>{minRating} ★</span>
                  </div>
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
                    <option value="rating">Rating</option>
                    <option value="reviews">Number of Reviews</option>
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
                      src={dispensary.image}
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
                          {dispensary.location}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          <FaStar className="text-yellow-400" />
                          <span className="ml-1 font-medium">{dispensary.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({dispensary.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    {dispensary.description && (
                      <p className="text-gray-600 mb-4">{dispensary.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {disciplines.find(d => d.id === dispensary.discipline)?.icon}
                        <span className="ml-2 text-sm">
                          {disciplines.find(d => d.id === dispensary.discipline)?.name}
                        </span>
                      </div>
                      <button className="btn-primary">
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