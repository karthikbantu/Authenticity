import { useState } from 'react';
import { Header } from './components/Header';
import { UrlSearchBar } from './components/UrlSearchBar';
import { SecurityResultCard } from './components/SecurityResultCard';
import { RecentChecks } from './components/RecentChecks';
import type { UrlCheckResult } from './types/urlCheck';
import { checkUrlWithBackend, API_ENDPOINT } from './services/urlService';
import './App.css';

function App() {
  const [currentResult, setCurrentResult] = useState<UrlCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<UrlCheckResult[]>([]);
  const [showBackendHelper, setShowBackendHelper] = useState<boolean>(false);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    try {
      const result = await checkUrlWithBackend(url);
      setCurrentResult(result);

      // Add to recent history (avoid duplicates at the top)
      setHistory((prev) => [
        result,
        ...prev.filter((item) => item.url.toLowerCase() !== result.url.toLowerCase()),
      ].slice(0, 5));
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResult = () => {
    setCurrentResult(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-container">
      {/* Background glow effects */}
      <div className="glow-sphere glow-sphere-top" aria-hidden="true" />
      <div className="glow-sphere glow-sphere-bottom" aria-hidden="true" />

      {/* Header section */}
      <Header apiEndpoint={API_ENDPOINT} />

      {/* Main Content Area - Search Tab in the Center */}
      <main className="main-content">
        <UrlSearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Security Result Card */}
        {currentResult && (
          <div className="result-section">
            <SecurityResultCard
              result={currentResult}
              onClear={handleClearResult}
              onRescan={handleSearch}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Recent Search History */}
        <RecentChecks
          history={history}
          onSelectUrl={handleSearch}
          onClearHistory={handleClearHistory}
        />

        {/* Backend Integration Quick Reference */}
        <div className="integration-guide-box">
          <button
            type="button"
            className="toggle-guide-btn"
            onClick={() => setShowBackendHelper((prev) => !prev)}
          >
            <span>{showBackendHelper ? '▲ Hide' : '▼ View'} Backend Integration Code (FastAPI / Express)</span>
          </button>

          {showBackendHelper && (
            <div className="guide-content">
              <p className="guide-desc">
                When you're ready to connect your backend, add this <code>POST /search</code> handler to your FastAPI backend:
              </p>
              <pre className="code-block">
                <code>{`# Add to your backend (e.g. main.py)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow requests from Vite frontend (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlRequest(BaseModel):
    url: string

@app.post("/api/check-url")
def check_url(payload: UrlRequest):
    # Your security analysis logic here:
    is_secure = payload.url.startswith("https://")
    return {
        "url": payload.url,
        "isSecure": is_secure,
        "threatLevel": "safe" if is_secure else "high",
        "score": 95 if is_secure else 30,
        "message": "URL verified as secure" if is_secure else "Insecure connection detected",
        "details": {
            "protocol": "https:" if is_secure else "http:",
            "flags": ["Valid SSL"] if is_secure else ["No SSL encryption"],
            "threatsDetected": [] if is_secure else ["Unencrypted HTTP"]
        }
    }`}</code>
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built for URL Safety & Document Processor Security Checks</p>
      </footer>
    </div>
  );
}

export default App;
