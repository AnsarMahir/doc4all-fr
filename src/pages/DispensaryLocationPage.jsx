import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { FaMapMarkerAlt, FaSave, FaEdit, FaArrowLeft, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { buildUrl, API_CONFIG } from '../config/api'
import { useNotifications } from '../contexts/NotificationContext'

const containerStyle = {
  width: '100%',
  height: '600px'
}

// Default center (Sri Lanka)
const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718
}

const libraries = ['places']

const DispensaryLocationPage = () => {
  const navigate = useNavigate()
  const { get, put } = useApi()
  const notifications = useNotifications()
  
  const [dispensaryProfile, setDispensaryProfile] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [center, setCenter] = useState(defaultCenter)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState(null)
  
  const mapRef = useRef(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  })

  // Fetch dispensary profile data
  const fetchDispensaryProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.PROFILE))
      console.log('Dispensary profile response:', response)
      
      const profile = response.data || response
      setDispensaryProfile(profile)
      
      // Set current location if available
      if (profile.latitude && profile.longitude) {
        const location = {
          lat: Number(profile.latitude),
          lng: Number(profile.longitude)
        }
        setCurrentLocation(location)
        setCenter(location)
        setSelectedLocation(location)
      }
    } catch (error) {
      console.error('Error fetching dispensary profile:', error)
      setError('Failed to load dispensary profile. Please try again.')
      notifications.error('Failed to load dispensary profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Update dispensary location
  const updateLocation = async () => {
    if (!selectedLocation) {
      notifications.error('Please select a location on the map')
      return
    }

    setIsUpdating(true)
    try {
      const response = await put(buildUrl('/dispensary/update-location'), {
        Latitude: selectedLocation.lat,
        Longitude: selectedLocation.lng
      })

      console.log('Update location response:', response)

      // The useApi hook now handles empty responses and returns { success: true } for successful operations
      // We can safely assume success if we reach this point without an error
      setCurrentLocation(selectedLocation)
      setIsEditMode(false)
      notifications.success('Location updated successfully!')
      
      // Update the profile state
      setDispensaryProfile(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }))

    } catch (error) {
      console.error('Error updating location:', error)
      notifications.error('Failed to update location. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle map click for location selection
  const handleMapClick = useCallback((event) => {
    if (isEditMode) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      setSelectedLocation(newLocation)
      setShowInfoWindow(true)
    }
  }, [isEditMode])

  // Handle marker click
  const handleMarkerClick = () => {
    setShowInfoWindow(true)
  }

  // Handle info window close
  const handleInfoWindowClose = () => {
    setShowInfoWindow(false)
  }

  // Map load callback
  const onMapLoad = useCallback((map) => {
    setMap(map)
    mapRef.current = map
  }, [])

  // Map unmount callback
  const onUnmount = useCallback(() => {
    setMap(null)
    mapRef.current = null
  }, [])

  // Start edit mode
  const startEdit = () => {
    setIsEditMode(true)
    setShowInfoWindow(false)
    if (currentLocation) {
      setSelectedLocation(currentLocation)
    }
  }

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false)
    setSelectedLocation(currentLocation)
    setShowInfoWindow(false)
  }

  // Get current GPS location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setSelectedLocation(location)
          setCenter(location)
          if (map) {
            map.panTo(location)
          }
          setShowInfoWindow(true)
        },
        (error) => {
          console.error('Error getting current location:', error)
          notifications.error('Unable to get your current location. Please select manually on the map.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      notifications.error('Geolocation is not supported by your browser')
    }
  }

  useEffect(() => {
    fetchDispensaryProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mb-4 mx-auto" />
          <p className="text-gray-600">Loading dispensary information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchDispensaryProfile}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Dispensary Location</h1>
          <p className="text-gray-600 mt-2">
            Manage your dispensary's location for patients to find you easily.
          </p>
        </div>

        {/* Dispensary Info */}
        {dispensaryProfile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dispensary Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{dispensaryProfile.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{dispensaryProfile.type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{dispensaryProfile.address || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium">{dispensaryProfile.phone || dispensaryProfile.email || 'Not specified'}</p>
              </div>
              {currentLocation && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Current Location</p>
                  <p className="font-medium">
                    Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Location Management</h3>
              <p className="text-sm text-gray-600">
                {isEditMode 
                  ? 'Click on the map to select a new location for your dispensary'
                  : 'Your current dispensary location is shown on the map'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              {!isEditMode ? (
                <button
                  onClick={startEdit}
                  className="btn-primary flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Change Location
                </button>
              ) : (
                <>
                  <button
                    onClick={getCurrentLocation}
                    className="btn-secondary flex items-center"
                  >
                    <FaMapMarkerAlt className="mr-2" />
                    Use Current GPS
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateLocation}
                    disabled={!selectedLocation || isUpdating}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Location
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Map View</h3>
          
          {isLoaded ? (
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onMapLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                  zoomControl: true,
                }}
              >
                {/* Current location marker */}
                {currentLocation && !isEditMode && (
                  <Marker
                    position={currentLocation}
                    onClick={handleMarkerClick}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: "#10B981",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#FFFFFF",
                      scale: 2.5,
                      anchor: { x: 12, y: 22 },
                    }}
                    title="Current Dispensary Location"
                  />
                )}

                {/* Selected location marker (during edit) */}
                {selectedLocation && isEditMode && (
                  <Marker
                    position={selectedLocation}
                    onClick={handleMarkerClick}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: "#EF4444",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#FFFFFF",
                      scale: 2.5,
                      anchor: { x: 12, y: 22 },
                    }}
                    title="New Location (Click Save to confirm)"
                  />
                )}

                {/* Info Window */}
                {showInfoWindow && (selectedLocation || currentLocation) && (
                  <InfoWindow
                    position={isEditMode ? selectedLocation : currentLocation}
                    onCloseClick={handleInfoWindowClose}
                  >
                    <div className="max-w-xs">
                      <h4 className="font-semibold mb-2">
                        {isEditMode ? 'New Location' : 'Current Dispensary Location'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {dispensaryProfile?.name || 'Your Dispensary'}
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>Lat: {(isEditMode ? selectedLocation : currentLocation)?.lat.toFixed(6)}</p>
                        <p>Lng: {(isEditMode ? selectedLocation : currentLocation)?.lng.toFixed(6)}</p>
                      </div>
                      {isEditMode && (
                        <div className="mt-3">
                          <button
                            onClick={updateLocation}
                            disabled={isUpdating}
                            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded disabled:opacity-50"
                          >
                            {isUpdating ? 'Saving...' : 'Save This Location'}
                          </button>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          ) : (
            <div className="h-[600px] bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <FaSpinner className="animate-spin text-2xl text-gray-400 mb-2 mx-auto" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Instructions */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click "Change Location" to enter edit mode</li>
              <li>• Click anywhere on the map to select a new location</li>
              <li>• Use "Use Current GPS" to automatically detect your location</li>
              <li>• Click "Save Location" to confirm your selection</li>
              <li>• Your location helps patients find your dispensary easily</li>
            </ul>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Current Location</span>
            </div>
            {isEditMode && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">New Location (Preview)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryLocationPage