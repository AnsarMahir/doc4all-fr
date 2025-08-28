# Find Dispensaries Page - Integration Guide

## Overview

The FindDispensariesPage allows patients to find nearby dispensaries using Google Maps. Currently it uses mock data, but it's designed to integrate with your actual dispensary database.

## How It Works

### Location Detection

- **Automatic**: Tries to get user's location when page loads
- **Manual**: Users can click "Get My Location" button to request location access
- **Error Handling**: Shows helpful error messages if location access fails
- **Retry**: Users can update their location anytime

### Dispensary Data Source

**Currently**: Uses mock/sample dispensary data
**Production**: Will fetch from your backend API

### Google Maps Integration

- Uses your Google Maps API key from environment variables
- Displays user location with a blue circle
- Shows search radius as a circle overlay
- Displays dispensary markers color-coded by discipline:
  - 🟢 Green: Ayurvedic Medicine
  - 🔵 Blue: Homeopathic Treatment
  - 🔴 Red: Western Medicine

## Integration Steps

### 1. Backend API Requirements

Create an API endpoint that returns dispensary data:

```javascript
// Example API endpoint: GET /api/dispensaries
// Optional query parameters: lat, lng, radius, discipline

Response format:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Wellness Ayurveda Center",
      "location": {
        "lat": 6.9271,
        "lng": 79.8612
      },
      "address": "123 Main St, Colombo, Sri Lanka",
      "phone": "+94 11 234 5678",
      "website": "https://wellness-ayurveda.com",
      "discipline": "ayurvedic", // "ayurvedic" | "homeopathic" | "western"
      "rating": 4.8,
      "reviewCount": 124,
      "description": "Specializing in traditional Ayurvedic treatments..."
    }
  ]
}
```

### 2. Update the Frontend Code

In `src/pages/FindDispensariesPage.jsx`, update the `fetchDispensaries` function:

```javascript
const fetchDispensaries = async () => {
  setIsLoadingDispensaries(true);
  try {
    // Replace this with your actual API call
    const response = await get("/dispensaries");
    setAllDispensaries(response.data);
  } catch (error) {
    console.error("Error fetching dispensaries:", error);
    // Fallback to mock data if API fails
    setAllDispensaries(mockDispensaries);
  } finally {
    setIsLoadingDispensaries(false);
  }
};
```

### 3. Database Requirements

Ensure your dispensaries table includes:

- `latitude` and `longitude` columns (DECIMAL type, high precision)
- `discipline` field with values: 'ayurvedic', 'homeopathic', 'western'
- `rating` and `review_count` for display
- Contact information: `phone`, `website`
- `description` field for info windows

### 4. Optional Enhancements

#### Server-side Filtering

Add query parameters to your API for better performance:

- `lat`, `lng`: User's coordinates
- `radius`: Search radius in kilometers
- `discipline`: Filter by treatment type

#### Geocoding

If you don't have lat/lng coordinates:

1. Use Google Geocoding API to convert addresses to coordinates
2. Store coordinates in your database for faster queries
3. Consider using PostGIS for spatial queries if using PostgreSQL

#### Real-time Updates

- Add WebSocket support for real-time dispensary status
- Show if dispensaries are currently open/closed
- Display current wait times or availability

## Environment Setup

1. Add your Google Maps API key to `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Enable required Google Cloud APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (if needed)

## Testing

1. Test with mock data first
2. Verify location detection works
3. Test with real API data
4. Test error scenarios (no location, API failures)
5. Test on mobile devices

## Security Notes

- Never expose API keys in client-side code for production
- Consider API key restrictions in Google Cloud Console
- Implement rate limiting on your dispensary API
- Validate and sanitize user location data

## Performance Considerations

- Implement pagination for large datasets
- Cache dispensary data appropriately
- Use map clustering for many nearby dispensaries
- Consider lazy loading for dispensary details
