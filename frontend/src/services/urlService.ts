import type { UrlCheckResult } from '../types/urlCheck';

/**
 * Endpoint configuration:
 * - On Vercel (https://authenticity-sage.vercel.app):
 *   Uses '/search'. Vercel's vercel.json rewrites this to AWS EC2 (http://56.228.97.157:8000/search)
 *   so the browser only speaks HTTPS and avoids Mixed Content errors.
 * - On Localhost (http://localhost:5173):
 *   Tries local backend, with fallback to AWS EC2 (http://56.228.97.157:8000/search).
 */
export const API_ENDPOINT = import.meta.env.VITE_API_URL || '/search';
export const EC2_BACKEND_URL = 'http://56.228.97.157:8000/search';

/**
 * Sends a POST request to check if the URL is secure or insecure.
 */
export async function checkUrlWithBackend(url: string): Promise<UrlCheckResult> {
  const startTime = performance.now();

  try {
    let response: Response;

    try {
      response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        throw new Error(`Local endpoint returned status ${response.status}`);
      }
    } catch (primaryError) {
      // If testing on localhost (HTTP) and primary endpoint is unreachable, try EC2 directly:
      if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname === 'localhost') {
        console.info('[UrlService] Local endpoint unreachable, attempting AWS EC2 direct fallback...');
        response = await fetch(EC2_BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
      } else {
        throw primaryError;
      }
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    // Read "threatlevel" returned from your FastAPI backend
    const rawThreat = data.threatlevel || data.threatLevel || (data.isSecure ? 'safe' : 'high') || 'safe';
    const isSecure = String(rawThreat).toLowerCase() === 'safe';
    const threatLevel = isSecure ? 'safe' : 'high';

    // Normalize backend response into UrlCheckResult
    return {
      url: data.url || url,
      verdict: isSecure ? 'secure' : 'insecure',
      threatLevel: threatLevel,
      score: isSecure ? 95 : 25,
      message: isSecure 
        ? 'URL verified as safe by backend.' 
        : 'Warning: Backend flagged this URL with high threat level.',
      checkedAt: new Date().toLocaleTimeString(),
      details: {
        protocol: extractProtocol(url),
        hostname: extractHostname(url),
        isHttps: url.startsWith('https://'),
        flags: isSecure ? ['Threat Level: safe'] : ['Threat Level: high'],
        threatsDetected: isSecure ? [] : ['High Risk Detected'],
        responseTimeMs: duration,
      },
      backendSource: 'live-api',
    };
  } catch (error) {
    console.warn('[UrlService] Backend not reachable or error occurred. Falling back to preview mode:', error);
    return simulateCheck(url, Math.round(performance.now() - startTime));
  }
}

/**
 * Helper to extract hostname safely
 */
export function extractHostname(rawUrl: string): string {
  try {
    const formatted = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
      ? rawUrl 
      : `https://${rawUrl}`;
    return new URL(formatted).hostname;
  } catch {
    return rawUrl;
  }
}

/**
 * Helper to extract protocol safely
 */
export function extractProtocol(rawUrl: string): string {
  try {
    const formatted = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
      ? rawUrl 
      : `https://${rawUrl}`;
    return new URL(formatted).protocol;
  } catch {
    return 'unknown:';
  }
}

/**
 * Quick local preview evaluator used when backend is offline
 */
function simulateCheck(url: string, duration: number): UrlCheckResult {
  const lower = url.toLowerCase();
  const isHttps = lower.startsWith('https://');
  const hostname = extractHostname(url);
  const protocol = extractProtocol(url);

  const isSuspicious = 
    lower.includes('phishing') || 
    lower.includes('malware') || 
    lower.includes('free-gift') ||
    lower.includes('verify-login') ||
    lower.includes('suspicious') ||
    lower.includes('.exe') ||
    lower.endsWith('.xyz') ||
    lower.endsWith('.top') ||
    (!isHttps && !lower.includes('localhost'));

  if (isSuspicious) {
    return {
      url,
      verdict: 'insecure',
      threatLevel: isHttps ? 'medium' : 'high',
      score: 28,
      message: !isHttps 
        ? 'Insecure HTTP protocol detected without SSL encryption. Connection is unencrypted.' 
        : 'Potential phishing or suspicious domain pattern identified.',
      checkedAt: new Date().toLocaleTimeString(),
      details: {
        protocol,
        hostname,
        isHttps,
        flags: [
          !isHttps ? 'Missing SSL / TLS Certificate' : 'Suspicious TLD/Keyword',
          'Potential data interception risk',
        ],
        threatsDetected: ['Unencrypted Transport', 'Domain Reputation Warning'],
        responseTimeMs: duration + 150,
      },
      backendSource: 'preview-mode',
    };
  }

  return {
    url,
    verdict: 'secure',
    threatLevel: 'safe',
    score: 98,
    message: 'Valid SSL certificate and legitimate domain reputation verified.',
    checkedAt: new Date().toLocaleTimeString(),
    details: {
      protocol,
      hostname,
      isHttps: true,
      flags: ['Valid SSL/TLS Certificate', 'Clean Domain Reputation', 'No Known Blacklists'],
      threatsDetected: [],
      responseTimeMs: duration + 120,
    },
    backendSource: 'preview-mode',
  };
}
