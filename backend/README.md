---
title: Vietnam POI Finder API
emoji: 🗺️
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
---

# Vietnam POI Finder - Backend API

FastAPI backend for Vietnam Points of Interest Finder application.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/geocode?q={query}` | Geocode location in Vietnam |
| GET | `/api/weather?lat={lat}&lon={lon}` | Get weather data |
| POST | `/api/pois` | Get Points of Interest |
| POST | `/api/translate` | Translate text EN↔VI |
| POST | `/api/chat` | AI Travel Chatbot |

## Environment Variables

Set these in HuggingFace Space Settings → Repository secrets:

- `OPENWEATHER_API_KEY`: Your OpenWeather API key

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app:app --reload --port 7860
```

## Deployment

This is configured for HuggingFace Spaces with Docker SDK.
Simply push to your Space repository and it will auto-deploy.
