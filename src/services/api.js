/**
 * API Service Module
 * Centralized API calls to HuggingFace backend
 */

// Backend URL - change this after deploying to HuggingFace Spaces
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

/**
 * Geocode a location in Vietnam
 * @param {string} query - Location name to search
 * @returns {Promise<{lat: number, lon: number, display_name: string, searched_city: string}>}
 */
export async function geocodeLocation(query) {
  const response = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Location not found');
  }
  return response.json();
}

/**
 * Get weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} city - City name for display
 * @returns {Promise<Object>} Weather data
 */
export async function getWeather(lat, lon, city = '') {
  const response = await fetch(
    `${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Weather fetch failed');
  }
  return response.json();
}

/**
 * Get Points of Interest near a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters (default: 3000)
 * @returns {Promise<{pois: Array}>}
 */
export async function getPOIs(lat, lon, radius = 3000) {
  const response = await fetch(`${API_BASE_URL}/api/pois`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, radius })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'POI fetch failed');
  }
  return response.json();
}

/**
 * Translate text from English to Vietnamese
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (default: 'en')
 * @param {string} targetLang - Target language code (default: 'vi')
 * @returns {Promise<{translated_text: string}>}
 */
export async function translateText(text, sourceLang = 'en', targetLang = 'vi') {
  const response = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text, 
      source_lang: sourceLang, 
      target_lang: targetLang 
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Translation failed');
  }
  return response.json();
}

/**
 * Send message to AI Chatbot
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @returns {Promise<{response: string}>}
 */
export async function sendChatMessage(message, history = []) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Chat failed');
  }
  return response.json();
}

/**
 * Check if backend API is healthy
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}

// Export API base URL for debugging
export { API_BASE_URL };
