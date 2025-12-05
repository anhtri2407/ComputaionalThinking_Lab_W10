import React, { useState } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import TranslatorPopup from './components/TranslatorPopup';
import AuthModal from './components/Auth/AuthModal';
import UserMenu from './components/Auth/UserMenu';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [pois, setPois] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { currentUser } = useAuth();
  
  // Get OpenWeather API key from environment variable
  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const handleLocationSearch = async (locationName) => {
    setLoading(true);
    setError(null);
    
    try {
      // Search for location in Vietnam using Nominatim API
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)},Vietnam&format=json&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.length === 0) {
        setError('Location not found in Vietnam. Please try another search.');
        setLoading(false);
        return;
      }
      
      const { lat, lon, display_name } = geocodeData[0];
      const coords = [parseFloat(lat), parseFloat(lon)];
      
      // Extract the main city name from the search or display_name
      const cityName = locationName || display_name.split(',')[0];
      
      setLocation({
        coordinates: coords,
        name: display_name,
        searchedCity: cityName
      });
      
      // Fetch weather data and points of interest in parallel
      await Promise.all([
        fetchPointsOfInterest(lat, lon),
        fetchWeatherData(lat, lon, cityName)
      ]);
      
    } catch (err) {
      setError('Failed to fetch location data. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsOfInterest = async (lat, lon, retryCount = 0) => {
    try {
      // Use Overpass API to get points of interest
      // Search within 3km radius for better results
      const radius = 3000;
      const query = `
        [out:json][timeout:25];
        (
          node["tourism"](around:${radius},${lat},${lon});
          node["amenity"="restaurant"](around:${radius},${lat},${lon});
          node["amenity"="cafe"](around:${radius},${lat},${lon});
          node["historic"](around:${radius},${lat},${lon});
          node["leisure"](around:${radius},${lat},${lon});
          node["shop"="mall"](around:${radius},${lat},${lon});
          node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
        );
        out body 15;
      `;
      
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        console.warn('Overpass API error:', response.status, response.statusText);
        throw new Error(`Overpass API returned ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Overpass API returned non-JSON response');
        throw new Error('Invalid response from Overpass API');
      }
      
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const poisData = data.elements.map((element) => {
          const tags = element.tags;
          return {
            id: element.id,
            name: tags.name || tags['name:en'] || tags['name:vi'] || 'Unnamed location',
            type: tags.tourism || tags.amenity || tags.historic || tags.leisure || 'Point of Interest',
            coordinates: [element.lat, element.lon],
            description: tags.description || tags['description:en'] || tags.note || '',
            address: [
              tags['addr:housenumber'],
              tags['addr:street'],
              tags['addr:district'],
              tags['addr:city'],
              tags['addr:province']
            ].filter(Boolean).join(', ') || tags.address || '',
            phone: tags.phone || tags['contact:phone'] || '',
            website: tags.website || tags['contact:website'] || '',
            openingHours: tags.opening_hours || tags['opening_hours:covid19'] || '',
            cuisine: tags.cuisine || '',
            rating: tags['stars'] || '',
            wikipedia: tags.wikipedia || tags['wikipedia:en'] || '',
            wikidata: tags.wikidata || '',
            email: tags.email || tags['contact:email'] || '',
            tags: tags
          };
        });
        
        setPois(poisData.slice(0, 5)); // Limit to 5 POIs
      } else {
        setPois([]);
        console.warn('No POIs found in the response');
      }
    } catch (err) {
      console.error('Error fetching POIs:', err);
      
      // Retry once after a short delay
      if (retryCount < 1) {
        console.log('Retrying POI fetch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchPointsOfInterest(lat, lon, retryCount + 1);
      }
      
      setPois([]);
      // Don't set error message for POI failures, as weather still works
      console.warn('Could not fetch points of interest. The Overpass API may be temporarily unavailable.');
    }
  };

  const fetchWeatherData = async (lat, lon, cityName) => {
    try {
      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('OpenWeather API key not configured');
        setWeather(null);
        return;
      }
      
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
      
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Weather API error:', errorData);
        throw new Error(`Weather data not available: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      setWeather({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        city: cityName || data.name  // Use the searched city name instead of API's name
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setWeather(null);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <h1>🗺️ Vietnam Points of Interest Finder</h1>
              <p>Discover interesting places across Vietnam</p>
            </div>
            <div className="header-auth">
              {currentUser ? (
                <UserMenu />
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </header>
        
        <SearchBar 
          onSearch={handleLocationSearch} 
          loading={loading}
        />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {location && (
          <div className="location-info">
            <h3>📍 Location: {location.name}</h3>
            {pois.length > 0 ? (
              <p>{pois.length} point(s) of interest found nearby</p>
            ) : loading ? (
              <p style={{ color: '#2196f3', fontSize: '13px' }}>
                🔍 Searching for points of interest...
              </p>
            ) : weather ? (
              <p style={{ color: '#ff9800', fontSize: '13px' }}>
                ⚠️ No points of interest found nearby. Try a major city or tourist area.
              </p>
            ) : null}
          </div>
        )}
        
        {weather && (
          <div className="weather-card">
            <div className="weather-header">
              <div className="weather-main">
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="weather-icon"
                />
                <div className="weather-temp">
                  <h2>{weather.temp}°C</h2>
                  <p className="weather-description">{weather.description}</p>
                </div>
              </div>
              <div className="weather-location">
                <p>{weather.city}</p>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-detail-item">
                <span className="weather-label">Feels Like</span>
                <span className="weather-value">{weather.feelsLike}°C</span>
              </div>
              <div className="weather-detail-item">
                <span className="weather-label">Humidity</span>
                <span className="weather-value">{weather.humidity}%</span>
              </div>
              <div className="weather-detail-item">
                <span className="weather-label">Wind Speed</span>
                <span className="weather-value">{weather.windSpeed} m/s</span>
              </div>
              <div className="weather-detail-item">
                <span className="weather-label">Pressure</span>
                <span className="weather-value">{weather.pressure} hPa</span>
              </div>
              <div className="weather-detail-item">
                <span className="weather-label">Min/Max</span>
                <span className="weather-value">{weather.tempMin}°C / {weather.tempMax}°C</span>
              </div>
            </div>
          </div>
        )}
        
        <Map 
          location={location} 
          pois={pois}
        />
        
        {pois.length > 0 && (
          <div className="poi-list">
            <h3>Points of Interest:</h3>
            <div className="poi-cards">
              {pois.map((poi, index) => (
                <div key={poi.id} className="poi-card">
                  <div className="poi-card-header">
                    <h4>{index + 1}. {poi.name}</h4>
                    <span className="poi-type">{poi.type}</span>
                  </div>
                  
                  {poi.description && (
                    <p className="poi-description">{poi.description}</p>
                  )}
                  
                  <div className="poi-details">
                    {poi.address && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{poi.address}</span>
                      </div>
                    )}
                    
                    {poi.phone && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">📞</span>
                        <a href={`tel:${poi.phone}`}>{poi.phone}</a>
                      </div>
                    )}
                    
                    {poi.openingHours && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">🕒</span>
                        <span>{poi.openingHours}</span>
                      </div>
                    )}
                    
                    {poi.cuisine && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">🍽️</span>
                        <span>Cuisine: {poi.cuisine}</span>
                      </div>
                    )}
                    
                    {poi.rating && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">⭐</span>
                        <span>{poi.rating} stars</span>
                      </div>
                    )}
                    
                    {poi.website && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">🌐</span>
                        <a href={poi.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    {poi.email && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">📧</span>
                        <a href={`mailto:${poi.email}`}>{poi.email}</a>
                      </div>
                    )}
                    
                    {poi.wikipedia && (
                      <div className="poi-detail-item">
                        <span className="detail-icon">📖</span>
                        <a href={`https://en.wikipedia.org/wiki/${poi.wikipedia.split(':')[1] || poi.wikipedia}`} 
                           target="_blank" 
                           rel="noopener noreferrer">
                          Wikipedia
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="poi-coordinates">
                    <small>Coordinates: {poi.coordinates[0].toFixed(5)}, {poi.coordinates[1].toFixed(5)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Translation Popup */}
      <TranslatorPopup />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;
