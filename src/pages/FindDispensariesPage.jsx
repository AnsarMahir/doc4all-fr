import { useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api'
import { FaMapMarkerAlt, FaDirections, FaPhone, FaGlobe, FaLeaf, FaYinYang, FaHospital, FaStar } from 'react-icons/fa'

const containerStyle = {
  width: '100%',
  height: '600px'
}

// Default center (can be a central location in your target market)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194 // San Francisco as example
}

const libraries = ['places']

// Mock data for dispensaries (in a real app, this would come from your backend)
const mockDispensaries = [
  {
    id: 1,
    name: "Wellness Ayurveda Center",
    location: { lat: 37.7739, lng: -122.4312 },
    address: "123 Kahatwoita St, Nittambuwa, WP",
    phone: "+1 (415) 555-1234",
    website: "https://wellness-ayurveda.example.com",
    discipline: "ayurvedic",
    rating: 4.8,
    reviewCount: 124,
    description: "Specializing in traditional Ayurvedic treatments with a focus on holistic healing and natural remedies."
  },
  {
    id: 2,
    name: "Homeopathic Harmony",
    location: { lat: 37.7819, lng: -122.4159 },
    address: "456 Nawala Way, Colombo, WP",
    phone: "+1 (415) 555-5678",
    website: "https://homeopathic-harmony.example.com",
    discipline: "homeopathic",
    rating: 4.5,
    reviewCount: 89,
    description: "Providing gentle, effective homeopathic treatments for chronic and acute conditions."
  },
  {
    id: 3,
    name: "City Medical Center",
    location: { lat: 37.7699, lng: -122.4269 },
    address:"789 Bogaha Road, Colombo 8, WP",
    phone: "+1 (415) 555-9012",
    website: "https://citymedical.example.com",
    discipline: "western",
    rating: 4.7,
    reviewCount: 215,
    description: "Full-service medical center with specialists in various fields of conventional medicine."
  },
  {
    id: 4,
    name: "Ayurvedic Wellness Spa",
    location: { lat: 37.7829, lng: -122.4232 },
    address: "101 Maradana Road, Colombo 10, WP",
    phone: "+1 (415) 555-3456",
    website: "https://ayurvedic-spa.example.com",
    discipline: "ayurvedic",
    rating: 4.9,
    reviewCount: 76,
    description: "Combining traditional Ayurvedic practices with modern wellness techniques for optimal health."
  },
  {
    id: 5,
    name: "Homeopathic Family Clinic",
    location: { lat: 37.7769, lng: -122.4037 },
    address: "202 Ganemulla Lane, Borella, WP",
    phone: "+1 (415) 555-7890",
    website: "https://family-homeopathy.example.com",
    discipline: "homeopathic",
    rating: 4.6,
    reviewCount: 103,
    description: "Family-focused homeopathic care for all ages, specializing in chronic condition management."
  },
  {
    id: 6,
    name: "Bay Area Medical Group",
    location: { lat: 37.7679, lng: -122.4129 },
    address: "303 Thihariya Road, Colombo , WP",
    phone: "+1 (415) 555-2345",
    website: "https://bayareamedical.example.com",
    discipline: "western",
    rating: 4.4,
    reviewCount: 187,
    description: "Comprehensive medical care with the latest diagnostic and treatment technologies."
  }
]

const FindDispensariesPage = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [center, setCenter] = useState(defaultCenter)
  const [map, setMap] = useState(null)
  const [nearbyDispensaries, setNearbyDispensaries] = useState([])
  const [selectedDispensary, setSelectedDispensary] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5) // in kilometers
  const [disciplineFilter, setDisciplineFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  
  const mapRef = useRef(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '', // Replace with your actual API key
    libraries
  })

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c // Distance in km
    return d
  }

  // Filter dispensaries based on location and discipline
  const filterDispensaries = useCallback(() => {
    if (!userLocation) return []

    let filtered = mockDispensaries.filter(dispensary => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        dispensary.location.lat, 
        dispensary.location.lng
      )
      
      dispensary.distance = distance // Add distance to dispensary object
      return distance <= searchRadius
    })

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance)

    // Filter by discipline if needed
    if (disciplineFilter !== 'all') {
      filtered = filtered.filter(d => d.discipline === disciplineFilter)
    }

    return filtered
  }, [userLocation, searchRadius, disciplineFilter])

  const onMapLoad = useCallback((map) => {
    setMap(map)
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
    mapRef.current = null
  }, [])

  const handleMarkerClick = (dispensary) => {
    setSelectedDispensary(dispensary)
  }

  const handleInfoWindowClose = () => {
    setSelectedDispensary(null)
  }

  const handleGetDirections = (dispensary) => {
    if (!dispensary) return
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dispensary.location.lat},${dispensary.location.lng}&destination_place_id=${dispensary.name}`
    window.open(url, '_blank')
  }

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

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(currentPosition)
          setCenter(currentPosition)
          setIsLoading(false)
        },
        (error) => {
          console.error('Error getting current location:', error)
          alert('Unable to get your current location. Using default location instead.')
          setUserLocation(defaultCenter)
          setIsLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
      setUserLocation(defaultCenter)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      const filtered = filterDispensaries()
      setNearbyDispensaries(filtered)
    }
  }, [userLocation, searchRadius, disciplineFilter, filterDispensaries])

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Find Nearby Dispensaries</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters and Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Search Filters</h2>
              
              <div className="mb-4">
                <label htmlFor="searchRadius" className="form-label">Search Radius (km)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="searchRadius"
                    min="1"
                    max="10"
                    step="1"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-gray-700 font-medium">{searchRadius} km</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="disciplineFilter" className="form-label">Treatment Discipline</label>
                <select
                  id="disciplineFilter"
                  value={disciplineFilter}
                  onChange={(e) => setDisciplineFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Disciplines</option>
                  <option value="ayurvedic">Ayurvedic Medicine</option>
                  <option value="homeopathic">Homeopathic Treatment</option>
                  <option value="western">Western Medicine</option>
                </select>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mt-6">
                <FaMapMarkerAlt className="text-primary-600 mr-2" />
                {userLocation ? (
                  <span>Showing results near your current location</span>
                ) : (
                  <span>Waiting for your location...</span>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Nearby Dispensaries 
                {!isLoading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({nearbyDispensaries.length} found)
                  </span>
                )}
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              ) : nearbyDispensaries.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {nearbyDispensaries.map(dispensary => (
                    <div 
                      key={dispensary.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedDispensary?.id === dispensary.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        handleMarkerClick(dispensary)
                        if (map) {
                          map.panTo(dispensary.location)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{dispensary.name}</h3>
                          <div className="flex items-center mt-1 text-sm">
                            {getDisciplineIcon(dispensary.discipline)}
                            <span className="ml-1 text-gray-600">{getDisciplineName(dispensary.discipline)}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < Math.floor(dispensary.rating) ? "text-yellow-400" : "text-gray-300"} size={14} />
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">{dispensary.rating} ({dispensary.reviewCount})</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{dispensary.address}</p>
                        </div>
                        <span className="text-sm font-medium text-primary-600">
                          {dispensary.distance.toFixed(1)} km
                        </span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `tel:${dispensary.phone}`
                          }}
                          className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                        >
                          <FaPhone className="mr-1" size={12} /> Call
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(dispensary.website, '_blank')
                          }}
                          className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                        >
                          <FaGlobe className="mr-1" size={12} /> Website
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGetDirections(dispensary)
                          }}
                          className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                        >
                          <FaDirections className="mr-1" size={12} /> Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No dispensaries found within {searchRadius}km.</p>
                  <p className="text-gray-500 mt-2">Try increasing your search radius or changing filters.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Map View</h2>
              
              {isLoaded ? (
                <div className="rounded-lg overflow-hidden border border-gray-300">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                    onLoad={onMapLoad}
                    onUnmount={onUnmount}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {/* User location marker */}
                    {userLocation && (
                      <>
                        <Marker
                          position={userLocation}
                          icon={{
                            path: 0, // Circle
                            scale: 8,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "#FFFFFF",
                            strokeWeight: 2,
                          }}
                          title="Your Location"
                        />
                        
                        {/* Search radius circle */}
                        <Circle
                          center={userLocation}
                          radius={searchRadius * 1000} // Convert km to meters
                          options={{
                            fillColor: "#4285F4",
                            fillOpacity: 0.1,
                            strokeColor: "#4285F4",
                            strokeOpacity: 0.5,
                            strokeWeight: 1,
                          }}
                        />
                      </>
                    )}
                    
                    {/* Dispensary markers */}
                    {nearbyDispensaries.map(dispensary => (
                      <Marker
                        key={dispensary.id}
                        position={dispensary.location}
                        onClick={() => handleMarkerClick(dispensary)}
                        icon={{
                          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                          fillColor: dispensary.discipline === 'ayurvedic' 
                            ? "#10B981" // green
                            : dispensary.discipline === 'homeopathic'
                              ? "#3B82F6" // blue
                              : "#EF4444", // red
                          fillOpacity: 1,
                          strokeWeight: 1,
                          strokeColor: "#FFFFFF",
                          scale: 2,
                          anchor: { x: 12, y: 22 },
                        }}
                      />
                    ))}
                    
                    {/* Info Window for selected dispensary */}
                    {selectedDispensary && (
                      <InfoWindow
                        position={selectedDispensary.location}
                        onCloseClick={handleInfoWindowClose}
                      >
                        <div className="max-w-xs">
                          <h3 className="font-medium text-gray-900 mb-1">{selectedDispensary.name}</h3>
                          <div className="flex items-center mb-1 text-sm">
                            {getDisciplineIcon(selectedDispensary.discipline)}
                            <span className="ml-1 text-gray-600">{getDisciplineName(selectedDispensary.discipline)}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < Math.floor(selectedDispensary.rating) ? "text-yellow-400" : "text-gray-300"} size={14} />
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">{selectedDispensary.rating} ({selectedDispensary.reviewCount})</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{selectedDispensary.address}</p>
                          <p className="text-sm text-gray-600 mb-3">{selectedDispensary.description}</p>
                          
                          <div className="flex justify-between">
                            <button 
                              onClick={() => window.location.href = `tel:${selectedDispensary.phone}`}
                              className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                            >
                              <FaPhone className="mr-1" size={12} /> Call
                            </button>
                            <button 
                              onClick={() => window.open(selectedDispensary.website, '_blank')}
                              className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                            >
                              <FaGlobe className="mr-1" size={12} /> Website
                            </button>
                            <button 
                              onClick={() => handleGetDirections(selectedDispensary)}
                              className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded flex items-center"
                            >
                              <FaDirections className="mr-1" size={12} /> Directions
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </div>
              ) : (
                <div className="h-[600px] bg-gray-100 flex items-center justify-center rounded-lg">
                  <p>Loading map...</p>
                </div>
              )}
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Your Location</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Ayurvedic</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Homeopathic</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Western</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100 bg-opacity-30 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{searchRadius}km Radius</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindDispensariesPage