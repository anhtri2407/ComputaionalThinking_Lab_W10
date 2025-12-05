import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for POIs
const poiIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view when location changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function Map({ location, pois }) {
  // Default center on Vietnam
  const defaultCenter = [16.0544, 108.2022]; // Da Nang, Vietnam
  const defaultZoom = 6;
  
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);

  useEffect(() => {
    if (location && location.coordinates) {
      setMapCenter(location.coordinates);
      setMapZoom(13);
    }
  }, [location]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
      >
        <ChangeMapView center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Main location marker */}
        {location && (
          <Marker position={location.coordinates}>
            <Popup>
              <div>
                <h3>📍 Search Location</h3>
                <p><strong>{location.name}</strong></p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* POI markers */}
        {pois.map((poi, index) => (
          <Marker 
            key={poi.id} 
            position={poi.coordinates}
            icon={poiIcon}
          >
            <Popup maxWidth={300}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '10px', color: '#333' }}>
                  🎯 {poi.name}
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Type:</strong> <span style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '10px',
                    fontSize: '11px',
                    marginLeft: '5px'
                  }}>{poi.type}</span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Position:</strong> {index + 1} of {pois.length}
                </div>
                
                {poi.description && (
                  <div style={{ marginBottom: '8px', fontStyle: 'italic', color: '#555' }}>
                    {poi.description}
                  </div>
                )}
                
                {poi.address && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>📍 Address:</strong><br />
                    {poi.address}
                  </div>
                )}
                
                {poi.phone && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>📞 Phone:</strong><br />
                    <a href={`tel:${poi.phone}`} style={{ color: '#667eea' }}>
                      {poi.phone}
                    </a>
                  </div>
                )}
                
                {poi.openingHours && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>🕒 Hours:</strong><br />
                    {poi.openingHours}
                  </div>
                )}
                
                {poi.cuisine && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>🍽️ Cuisine:</strong> {poi.cuisine}
                  </div>
                )}
                
                {poi.rating && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>⭐ Rating:</strong> {poi.rating} stars
                  </div>
                )}
                
                {poi.email && (
                  <div style={{ marginBottom: '6px' }}>
                    <strong>📧 Email:</strong><br />
                    <a href={`mailto:${poi.email}`} style={{ color: '#667eea' }}>
                      {poi.email}
                    </a>
                  </div>
                )}
                
                {poi.website && (
                  <div style={{ marginBottom: '6px' }}>
                    <a 
                      href={poi.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      🌐 Visit Website →
                    </a>
                  </div>
                )}
                
                {poi.wikipedia && (
                  <div style={{ marginBottom: '6px' }}>
                    <a 
                      href={`https://en.wikipedia.org/wiki/${poi.wikipedia.split(':')[1] || poi.wikipedia}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      📖 Wikipedia →
                    </a>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid #eee',
                  fontSize: '11px',
                  color: '#999'
                }}>
                  Lat: {poi.coordinates[0].toFixed(5)}, Lon: {poi.coordinates[1].toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
