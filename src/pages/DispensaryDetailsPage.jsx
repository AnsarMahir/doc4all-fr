import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaLeaf, FaYinYang, FaHospital, FaMosque, FaArrowLeft } from 'react-icons/fa'
import { API_CONFIG, buildUrl } from '../config/api'
import { useApi } from '../hooks/useApi'

// Mock images for dispensaries (since we don't provide images)
const getDispensaryImage = (type) => {
  const images = {
    Ayurvedic: "https://images.unsplash.com/photo-1731597076108-f3bbe268162f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Homeopathy: "https://images.unsplash.com/photo-1512867957657-38dbae50a35b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Western: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Unani: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
  return images[type] || images.Western
}

const getTypeIcon = (type) => {
  const icons = {
    Ayurvedic: <FaLeaf className="text-green-600" />,
    Homeopathy: <FaYinYang className="text-blue-600" />,
    Western: <FaHospital className="text-red-600" />,
    Unani: <FaMosque className="text-purple-600" />
  }
  return icons[type] || icons.Western
}

const DispensaryDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get } = useApi()
  
  const [dispensary, setDispensary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDispensaryDetails = async () => {
      try {
        setLoading(true)
        const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.DISPENSARY_DETAILS(id)))
        setDispensary(response)
      } catch (err) {
        setError('Failed to fetch dispensary details')
        console.error('Error fetching dispensary details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDispensaryDetails()
    }
  }, [id]) // Remove get from dependency array

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dispensary details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dispensary) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error || 'Dispensary not found'}</p>
            <button 
              onClick={() => navigate('/search-dispensaries')} 
              className="btn-primary"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-96 relative">
            <img
              src={getDispensaryImage(dispensary.type)}
              alt={dispensary.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{dispensary.name}</h1>
                <div className="flex items-center">
                  {getTypeIcon(dispensary.type)}
                  <span className="ml-2 text-lg">{dispensary.type} Medicine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                {dispensary.description ? (
                  <p className="text-gray-600 mb-6">{dispensary.description}</p>
                ) : (
                  <p className="text-gray-600 mb-6 italic">No description available.</p>
                )}

                <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-primary-600 mr-3" />
                    <span>{dispensary.address}</span>
                  </div>
                  
                  {dispensary.phoneNumber && (
                    <div className="flex items-center">
                      <FaPhone className="text-primary-600 mr-3" />
                      <a href={`tel:${dispensary.phoneNumber}`} className="text-primary-600 hover:underline">
                        {dispensary.phoneNumber}
                      </a>
                    </div>
                  )}
                  
                  {dispensary.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="text-primary-600 mr-3" />
                      <a href={`mailto:${dispensary.email}`} className="text-primary-600 hover:underline">
                        {dispensary.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Location & Additional Info */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Location</h3>
                {dispensary.latitude && dispensary.longitude ? (
                  <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-2">Coordinates:</p>
                      <p className="font-mono text-sm">
                        Lat: {dispensary.latitude}, Lng: {dispensary.longitude}
                      </p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com?q=${dispensary.latitude},${dispensary.longitude}`, '_blank')}
                        className="mt-3 btn-primary"
                      >
                        View on Google Maps
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600">Location coordinates not available</p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(dispensary.address)}`, '_blank')}
                        className="mt-3 btn-primary"
                      >
                        Search Address on Google Maps
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-3">Treatment Type</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    {getTypeIcon(dispensary.type)}
                    <div className="ml-3">
                      <h4 className="font-medium">{dispensary.type} Medicine</h4>
                      <p className="text-sm text-gray-600">
                        Specialized in {dispensary.type.toLowerCase()} treatments and therapies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryDetailsPage