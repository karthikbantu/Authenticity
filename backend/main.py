import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import HttpUrl, BaseModel
from dotenv import load_dotenv
from google import genai


app = FastAPI()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def get_mssg():
    return {
        "Hello Karthik"
    }

@app.get('/this')
def execute():
    return{
        "Message": "Hello this is this"
    }

class UrlRequest(BaseModel):
    url: str

client = genai.Client()


@app.post('/search')
def search_urls(playload: UrlRequest):
    prompt = f"Analyze this URL for security, pishing, or malware risks: {playload.url}. Is it safe? Answer with only one word: 'safe' or 'high'."

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    verdict = response.text.strip().lower()k

    return {
        "threatlevel":"safe" if "safe" in verdict else "high"
    }

