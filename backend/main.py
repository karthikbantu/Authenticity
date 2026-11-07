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

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing. Please set it in Vercel Project Settings.")
    return genai.Client(api_key=api_key)

@app.get('/')
def get_mssg():
    return {
        "message": "Hello from Document Processor Backend on Vercel"
    }

@app.get('/this')
def execute():
    return {
        "Message": "Hello this is this"
    }

@app.post('/search')
def search_urls(playload: UrlRequest):
    client = get_gemini_client()

    prompt = (
        f"Analyze this URL for security, phishing, or malware risks: {playload.url}. "
        f"Is it safe? Answer with only one word: 'safe' or 'high'."
    )

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt
    )

    verdict = response.text.strip().lower()

    return {
        "threatlevel": "safe" if "safe" in verdict else "high"
    }
