"""
Vietnam POI Finder - FastAPI Backend
Hosted on HuggingFace Spaces
"""

import os
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Vietnam POI Finder API",
    description="Backend API for Vietnam Points of Interest Finder",
    version="1.0.0"
)

# CORS configuration - allow all origins for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API keys from environment
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# Pydantic models for request/response
class POIRequest(BaseModel):
    lat: float
    lon: float
    radius: int = 3000

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str = "vi"

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    
# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "message": "Vietnam POI Finder API is running!",
        "version": "1.0.0"
    }

# Geocoding endpoint
@app.get("/api/geocode")
async def geocode(q: str = Query(..., description="Location query")):
    """
    Geocode a location name in Vietnam using Nominatim API
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": f"{q},Vietnam",
                    "format": "json",
                    "limit": 1
                },
                headers={"User-Agent": "VietnamPOIFinder/1.0"}
            )
            response.raise_for_status()
            data = response.json()
            
            if not data:
                raise HTTPException(status_code=404, detail="Location not found in Vietnam")
            
            result = data[0]
            return {
                "lat": float(result["lat"]),
                "lon": float(result["lon"]),
                "display_name": result["display_name"],
                "searched_city": q
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Geocoding failed: {str(e)}")

# Weather endpoint
@app.get("/api/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    city: str = Query("", description="City name for display")
):
    """
    Get weather data from OpenWeather API
    """
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "units": "metric",
                    "appid": OPENWEATHER_API_KEY
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "temp": round(data["main"]["temp"]),
                "feelsLike": round(data["main"]["feels_like"]),
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "humidity": data["main"]["humidity"],
                "windSpeed": data["wind"]["speed"],
                "pressure": data["main"]["pressure"],
                "tempMin": round(data["main"]["temp_min"]),
                "tempMax": round(data["main"]["temp_max"]),
                "city": city or data["name"]
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")

# POI endpoint
@app.post("/api/pois")
async def get_pois(request: POIRequest):
    """
    Get Points of Interest from Overpass API (OpenStreetMap)
    """
    query = f"""
        [out:json][timeout:25];
        (
          node["tourism"](around:{request.radius},{request.lat},{request.lon});
          node["amenity"="restaurant"](around:{request.radius},{request.lat},{request.lon});
          node["amenity"="cafe"](around:{request.radius},{request.lat},{request.lon});
          node["historic"](around:{request.radius},{request.lat},{request.lon});
          node["leisure"](around:{request.radius},{request.lat},{request.lon});
          node["shop"="mall"](around:{request.radius},{request.lat},{request.lon});
          node["amenity"="place_of_worship"](around:{request.radius},{request.lat},{request.lon});
        );
        out body 15;
    """
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://overpass-api.de/api/interpreter",
                content=query,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            data = response.json()
            
            pois = []
            for element in data.get("elements", [])[:5]:  # Limit to 5 POIs
                tags = element.get("tags", {})
                pois.append({
                    "id": element["id"],
                    "name": tags.get("name") or tags.get("name:en") or tags.get("name:vi") or "Unnamed location",
                    "type": tags.get("tourism") or tags.get("amenity") or tags.get("historic") or tags.get("leisure") or "Point of Interest",
                    "coordinates": [element["lat"], element["lon"]],
                    "description": tags.get("description") or tags.get("description:en") or tags.get("note") or "",
                    "address": ", ".join(filter(None, [
                        tags.get("addr:housenumber"),
                        tags.get("addr:street"),
                        tags.get("addr:district"),
                        tags.get("addr:city"),
                        tags.get("addr:province")
                    ])) or tags.get("address") or "",
                    "phone": tags.get("phone") or tags.get("contact:phone") or "",
                    "website": tags.get("website") or tags.get("contact:website") or "",
                    "openingHours": tags.get("opening_hours") or "",
                    "cuisine": tags.get("cuisine") or "",
                    "rating": tags.get("stars") or "",
                    "wikipedia": tags.get("wikipedia") or "",
                    "email": tags.get("email") or tags.get("contact:email") or ""
                })
            
            return {"pois": pois}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"POI fetch failed: {str(e)}")

# Translation endpoint using MyMemory API (free, no key required)
@app.post("/api/translate")
async def translate(request: TranslateRequest):
    """
    Translate text using MyMemory Translation API
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.mymemory.translated.net/get",
                params={
                    "q": request.text,
                    "langpair": f"{request.source_lang}|{request.target_lang}"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("responseStatus") == 200:
                return {
                    "translated_text": data["responseData"]["translatedText"],
                    "source": request.text,
                    "source_lang": request.source_lang,
                    "target_lang": request.target_lang
                }
            else:
                raise HTTPException(status_code=500, detail=data.get("responseDetails", "Translation failed"))
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# AI Chatbot endpoint using HuggingFace Inference API
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI Chatbot for Vietnam travel assistance
    Uses a simple rule-based response for demo (can be upgraded to HuggingFace model)
    """
    message = request.message.lower().strip()
    
    # Simple Vietnamese travel assistant responses
    responses = {
        "hello": "Xin chào! 👋 Tôi là trợ lý du lịch Việt Nam. Bạn muốn khám phá địa điểm nào?",
        "hi": "Xin chào! 👋 Tôi là trợ lý du lịch Việt Nam. Bạn muốn khám phá địa điểm nào?",
        "xin chào": "Xin chào bạn! 🇻🇳 Tôi có thể giúp bạn tìm hiểu về các địa điểm du lịch ở Việt Nam!",
        "hanoi": "Hà Nội là thủ đô của Việt Nam! 🏛️ Nổi tiếng với Hồ Hoàn Kiếm, Văn Miếu, và phở ngon nhất cả nước!",
        "hà nội": "Hà Nội là thủ đô của Việt Nam! 🏛️ Nổi tiếng với Hồ Hoàn Kiếm, Văn Miếu, và phở ngon nhất cả nước!",
        "ho chi minh": "TP. Hồ Chí Minh là thành phố lớn nhất Việt Nam! 🌆 Có Nhà thờ Đức Bà, Chợ Bến Thành, và ẩm thực đường phố tuyệt vời!",
        "hồ chí minh": "TP. Hồ Chí Minh là thành phố lớn nhất Việt Nam! 🌆 Có Nhà thờ Đức Bà, Chợ Bến Thành, và ẩm thực đường phố tuyệt vời!",
        "saigon": "Sài Gòn (TP.HCM) là thành phố năng động nhất Việt Nam! 🌆 Đừng quên thử bánh mì và cà phê sữa đá!",
        "da nang": "Đà Nẵng có bãi biển đẹp, Cầu Vàng nổi tiếng, và Bà Nà Hills! 🏖️ Là điểm đến tuyệt vời cho kỳ nghỉ!",
        "đà nẵng": "Đà Nẵng có bãi biển đẹp, Cầu Vàng nổi tiếng, và Bà Nà Hills! 🏖️ Là điểm đến tuyệt vời cho kỳ nghỉ!",
        "hoi an": "Hội An là phố cổ di sản UNESCO! 🏮 Đến đây thưởng thức cao lầu, bánh mì và ngắm đèn lồng đêm!",
        "hội an": "Hội An là phố cổ di sản UNESCO! 🏮 Đến đây thưởng thức cao lầu, bánh mì và ngắm đèn lồng đêm!",
        "pho": "Phở là món ăn quốc dân của Việt Nam! 🍜 Phở Hà Nội thanh nhẹ, phở Sài Gòn đậm đà hơn!",
        "phở": "Phở là món ăn quốc dân của Việt Nam! 🍜 Phở Hà Nội thanh nhẹ, phở Sài Gòn đậm đà hơn!",
        "weather": "Bạn có thể tìm kiếm địa điểm trên bản đồ để xem thời tiết hiện tại! ☀️",
        "thời tiết": "Bạn có thể tìm kiếm địa điểm trên bản đồ để xem thời tiết hiện tại! ☀️",
        "help": "Tôi có thể giúp bạn: 🗺️ Tìm địa điểm du lịch, 🌤️ Xem thời tiết, 🍜 Gợi ý ẩm thực, 🏮 Thông tin văn hóa Việt Nam!",
        "giúp": "Tôi có thể giúp bạn: 🗺️ Tìm địa điểm du lịch, 🌤️ Xem thời tiết, 🍜 Gợi ý ẩm thực, 🏮 Thông tin văn hóa Việt Nam!",
    }
    
    # Find matching response
    for key, response in responses.items():
        if key in message:
            return ChatResponse(response=response)
    
    # Default response
    return ChatResponse(
        response="Tôi là trợ lý du lịch Việt Nam! 🇻🇳 Hãy hỏi tôi về các thành phố như Hà Nội, Đà Nẵng, Hội An, hay TP.HCM nhé!"
    )

# Run with uvicorn when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
