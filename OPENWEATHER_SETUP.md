# OpenWeather API Setup Guide

## Quick Start

### 1. Get Your API Key

1. Visit [OpenWeather](https://openweathermap.org/api)
2. Click on "Sign Up" (top right corner)
3. Create a free account
4. After signing in, go to your [API keys page](https://home.openweathermap.org/api_keys)
5. Copy your API key (or generate a new one)

### 2. Add API Key to Your Project

**Option A: Direct configuration (Quick & Easy)**

Open `src/App.jsx` and replace:
```javascript
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';
```

With:
```javascript
const OPENWEATHER_API_KEY = 'your_actual_api_key_here';
```

**Option B: Environment Variables (Recommended for production)**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. Update `src/App.jsx`:
   ```javascript
   const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
   ```

4. Restart the development server

### 3. API Key Activation

⚠️ **Important**: New API keys may take 10 minutes to 2 hours to become active after generation.

If you get errors:
- Wait a few minutes and try again
- Check that you copied the key correctly
- Verify the key is active in your OpenWeather dashboard

### 4. Free Tier Limits

The free tier includes:
- ✅ 60 calls per minute
- ✅ 1,000,000 calls per month
- ✅ Current weather data
- ✅ 5-day forecast

This is more than enough for development and personal use!

## Troubleshooting

### Weather not showing?
1. Check browser console for errors
2. Verify API key is correct
3. Wait if key was just created
4. Make sure you're using the correct API endpoint

### API Key Security
- Never commit `.env` files to Git (it's in `.gitignore`)
- Use environment variables in production
- Consider rate limiting if deploying publicly

## Resources

- [OpenWeather API Documentation](https://openweathermap.org/api)
- [Current Weather API](https://openweathermap.org/current)
- [FAQ](https://openweathermap.org/faq)
