import React, { useState } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import TranslatorPopup from './components/TranslatorPopup';
import ChatBot from './components/ChatBot/ChatBot';
import AuthModal from './components/Auth/AuthModal';
import UserMenu from './components/Auth/UserMenu';
import { useAuth } from './contexts/AuthContext';
import { geocodeLocation, getWeather, getPOIs } from './services/api';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [pois, setPois] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { currentUser } = useAuth();

  const handleLocationSearch = async (locationName) => {
    setLoading(true);
    setError(null);

    try {
      // Use backend API for geocoding
      const geoData = await geocodeLocation(locationName);

      const coords = [geoData.lat, geoData.lon];
      const cityName = geoData.searched_city || locationName;

      setLocation({
        coordinates: coords,
        name: geoData.display_name,
        searchedCity: cityName
      });

      // Fetch weather data and points of interest in parallel using backend API
      await Promise.all([
        fetchPointsOfInterest(geoData.lat, geoData.lon),
        fetchWeatherData(geoData.lat, geoData.lon, cityName)
      ]);

    } catch (err) {
      if (err.message.includes('not found')) {
        setError('Không tìm thấy địa điểm ở Việt Nam. Vui lòng thử lại.');
      } else {
        setError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsOfInterest = async (lat, lon, retryCount = 0) => {
    try {
      // Use backend API to get points of interest
      const data = await getPOIs(lat, lon, 3000);

      if (data.pois && data.pois.length > 0) {
        setPois(data.pois);
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
      console.warn('Could not fetch points of interest. The API may be temporarily unavailable.');
    }
  };

  const fetchWeatherData = async (lat, lon, cityName) => {
    try {
      // Use backend API to get weather data
      const data = await getWeather(lat, lon, cityName);
      setWeather(data);
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

      {/* AI Chatbot */}
      <ChatBot />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;
