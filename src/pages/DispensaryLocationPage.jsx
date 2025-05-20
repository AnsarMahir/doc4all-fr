import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { FaMapMarkerAlt, FaSave, FaUndo } from 'react-icons/fa'

const containerStyle = {
  width: '100%',
  height: '500px'
}

// Default center (can be a central location in your target market)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194 // San Francisco as example
}

const libraries = ['places']

const DispensaryLocationPage = () => {
  const [dispensaryInfo, setDispensaryInfo] = useState({
    name: 'Your Dispensary Name',
    address: '',
    phone: '',
    website: '',
    description: '',
    discipline: 'western'
  })
  
  const [markerPosition, setMarkerPosition] = useState(null)
  const [center, setCenter] = useState(defaultCenter)
  const [map, setMap] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: '', // Replace with your actual API key
    libraries
  })

  const onMapClick = useCallback((event) => {
    setMarkerPosition({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    })
    setIsSaved(false)
  }, [])

  const onMapLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDispensaryInfo(prev => ({
      ...prev,
      [name]: value
    }))
    setIsSaved(false)
  }

  const handleSaveLocation = () => {
    if (!markerPosition) {
      alert('Please select a location on the map first')
      return
    }

    // In a real app, you would save this to your backend
    const locationData = {
      ...dispensaryInfo,
      location: markerPosition
    }
    
    console.log('Saving location data:', locationData)
    
    // Simulate successful save
    setIsSaved(true)
    
    // In a real app, you would make an API call here
    // Example: await api.saveDispensaryLocation(locationData)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCenter(currentPosition)
          setMarkerPosition(currentPosition)
          if (map) {
            map.panTo(currentPosition)
          }
          setIsSaved(false)
        },
        (error) => {
          console.error('Error getting current location:', error)
          alert('Unable to get your current location. Please select manually on the map.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  useEffect(() => {
    // Load saved location data if available (from localStorage in this demo)
    const savedData = localStorage.getItem('dispensaryLocationData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setDispensaryInfo({
          name: parsedData.name || 'Your Dispensary Name',
          address: parsedData.address || '',
          phone: parsedData.phone || '',
          website: parsedData.website || '',
          description: parsedData.description || '',
          discipline: parsedData.discipline || 'western'
        })
        
        if (parsedData.location) {
          setMarkerPosition(parsedData.location)
          setCenter(parsedData.location)
        }
      } catch (error) {
        console.error('Error parsing saved location data:', error)
      }
    }
  }, [])

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dispensary Location Management</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Dispensary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="name" className="form-label">Dispensary Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={dispensaryInfo.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={dispensaryInfo.address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={dispensaryInfo.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+1 (123) 456-7890"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="form-label">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={dispensaryInfo.website}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://yourdispensary.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={dispensaryInfo.description}
                  onChange={handleInputChange}
                  className="input-field min-h-[100px]"
                  placeholder="Describe your dispensary, services offered, etc."
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="discipline" className="form-label">Treatment Discipline</label>
                <select
                  id="discipline"
                  name="discipline"
                  value={dispensaryInfo.discipline}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="ayurvedic">Ayurvedic Medicine</option>
                  <option value="homeopathic">Homeopathic Treatment</option>
                  <option value="western">Western Medicine</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Set Your Location</h2>
              <button 
                onClick={handleUseCurrentLocation}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
              >
                <FaMapMarkerAlt className="mr-2 text-primary-600" />
                Use Current Location
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Click on the map to set your dispensary's exact location. This will be shown to patients searching for healthcare providers.
            </p>
            
            {isLoaded ? (
              <div className="rounded-lg overflow-hidden border border-gray-300 mb-4">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={14}
                  onClick={onMapClick}
                  onLoad={onMapLoad}
                  onUnmount={onUnmount}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {markerPosition && (
                    <Marker
                      position={markerPosition}
                      animation={2} // DROP animation
                    />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
                <p>Loading map...</p>
              </div>
            )}
            
            {markerPosition && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Selected Location</h3>
                <p className="text-sm text-gray-600">
                  Latitude: {markerPosition.lat.toFixed(6)}, Longitude: {markerPosition.lng.toFixed(6)}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setMarkerPosition(null)
                  setIsSaved(false)
                }}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md transition-colors duration-200"
              >
                <FaUndo className="mr-2" />
                Reset
              </button>
              
              <button 
                onClick={handleSaveLocation}
                className={`flex items-center ${isSaved ? 'bg-green-600' : 'bg-primary-600 hover:bg-primary-700'} text-white px-6 py-2 rounded-md transition-colors duration-200`}
                disabled={!markerPosition}
              >
                <FaSave className="mr-2" />
                {isSaved ? 'Saved!' : 'Save Location'}
              </button>
            </div>
          </div>
          
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary-800 mb-2">Why is your location important?</h3>
            <p className="text-primary-700 mb-4">
              Setting your precise location helps patients find you more easily. Your dispensary will appear in search results for patients looking for healthcare providers within a 5km radius of their location.
            </p>
            <p className="text-primary-700">
              Make sure your location is accurate to ensure patients can navigate to your dispensary correctly using Google Maps directions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryLocationPage