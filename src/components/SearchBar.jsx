import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const popularLocations = [
    'Hanoi',
    'Ho Chi Minh City',
    'Da Nang',
    'Hoi An',
    'Hue',
    'Nha Trang',
    'Ha Long',
    'Sapa'
  ];

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Enter a location in Vietnam (e.g., Hanoi, Da Nang, Hoi An)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? '🔍 Searching...' : '🔍 Search'}
        </button>
      </form>
      
      <div className="popular-locations">
        <span className="popular-label">Popular locations:</span>
        {popularLocations.map((location) => (
          <button
            key={location}
            className="location-chip"
            onClick={() => {
              setSearchTerm(location);
              onSearch(location);
            }}
            disabled={loading}
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
