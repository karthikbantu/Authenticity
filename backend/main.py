import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

# Load local .env (if present)
load_dotenv()

app = FastAPI()

# Allow requests from your React frontend (Vercel domain or localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlRequest(BaseModel):
    url: str

@app.get('/')
def get_root():
    return {
        "status": "online",
        "message": "URL Security Inspector Backend is running on EC2"
    }

@app.get('/this')
def execute():
    return {
        "Message": "Hello this is this"
    }

@app.post('/search')
def search_urls(playload: UrlRequest):
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            prompt = (
                f"Analyze this URL for security, phishing, or malware risks: {playload.url}. "
                f"Is it safe? Answer with only one word: 'safe' or 'high'."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            verdict = response.text.strip().lower()
            return {
                "threatlevel": "safe" if "safe" in verdict else "high"
            }
        except Exception as e:
            print("Gemini API call failed:", e)

    # Graceful fallback if GEMINI_API_KEY is not set or network failed
    is_safe = playload.url.startswith("https://") and not any(
        ext in playload.url.lower() for ext in [".exe", "phishing", "malware", ".xyz", ".top"]
    )
    return {
        "threatlevel": "safe" if is_safe else "high"
    }
