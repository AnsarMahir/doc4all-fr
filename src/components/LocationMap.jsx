// components/LocationMap.jsx
import { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaEdit } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const LocationMap = ({ latitude, longitude, address, name }) => {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  // Default to a central location if no coordinates provided
  const lat = latitude || 6.9271
  const lng = longitude || 79.8612
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo'}&q=${lat},${lng}&zoom=15`

  const handleMapLoad = () => {
    setMapLoaded(true)
  }

  const handleMapError = () => {
    setMapError(true)
  }

  if (mapError || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    // Fallback when Google Maps is not available
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Location</h3>
          <Link
            to="/dashboard/dispensary/location"
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <FaEdit className="mr-1 h-3 w-3" />
            Update
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
          <FaMapMarkerAlt className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">{name || 'Your Dispensary'}</h4>
            <p className="text-gray-600 text-sm">
              {address || 'Address not set'}
            </p>
            {latitude && longitude && (
              <p className="text-xs text-gray-500">
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
          <div className="mt-4">
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Location</h3>
        <Link
          to="/dashboard/dispensary/location"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
        >
          <FaEdit className="mr-1 h-3 w-3" />
          Update
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start">
            <FaMapMarkerAlt className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">{name || 'Your Dispensary'}</h4>
              <p className="text-sm text-gray-600">{address || 'Address not set'}</p>
              {latitude && longitude && (
                <p className="text-xs text-gray-500 mt-1">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={handleMapLoad}
            onError={handleMapError}
            className="rounded-lg"
          ></iframe>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View on Google Maps
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800"
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  )
}

export default LocationMap
