# Vietnam Points of Interest Finder

A React-based web application that allows users to search for locations in Vietnam and discover 5 points of interest nearby on an interactive OpenStreetMap.

## Features

- 🔍 Search for any location in Vietnam
- 🗺️ Interactive OpenStreetMap integration using React-Leaflet
- 📍 Display up to 5 nearby points of interest (restaurants, cafes, tourist attractions, historic sites, etc.)
- 🌤️ Real-time weather information for searched locations
- 🎯 Click on markers to see detailed information
- 📱 Responsive design for mobile and desktop
- 🚀 Quick access to popular Vietnamese cities

## Technologies Used

- React 18
- Vite
- Leaflet & React-Leaflet
- OpenStreetMap
- Nominatim API (geocoding)
- Overpass API (points of interest data)
- OpenWeather API (weather data)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Get a free OpenWeather API key:
   - Go to [OpenWeather](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

3. Configure the API key:
   - Open `src/App.jsx`
   - Replace `YOUR_API_KEY_HERE` with your actual OpenWeather API key:
   
```javascript
const OPENWEATHER_API_KEY = 'your_actual_api_key_here';
```

4. Run the development server:

```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. Enter a location name in the search bar (e.g., "Hanoi", "Da Nang", "Hoi An")
2. Click the Search button or press Enter
3. The map will center on your searched location and display:
   - Current weather conditions with temperature, humidity, wind speed, and more
   - Up to 5 points of interest nearby
4. Click on any marker to see more details about that location
5. Use the popular location chips for quick access to major Vietnamese cities

## Weather Information

The app displays comprehensive weather data including:

- 🌡️ Current temperature and "feels like" temperature
- 🌤️ Weather conditions with icons
- 💧 Humidity levels
- 💨 Wind speed
- 🔽 Atmospheric pressure
- 📊 Min/Max temperatures

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## APIs Used

- **Nominatim**: For geocoding location searches
- **Overpass API**: For fetching points of interest data from OpenStreetMap
- **OpenWeather API**: For real-time weather information

## Environment Variables (Optional)

For better security in production, you can use environment variables for the API key:

1. Create a `.env` file in the root directory:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

2. Update `src/App.jsx` to use the environment variable:

```javascript
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
```

## Credits

Built with references from:

- [OpenStreetMap with React Guide](https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1)
- OpenStreetMap and Leaflet documentation
- OpenWeather API documentation
