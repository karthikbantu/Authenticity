export type ThreatLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export type SecurityVerdict = 'secure' | 'insecure' | 'warning' | 'unknown';

export interface UrlCheckResult {
  url: string;
  verdict: SecurityVerdict;
  threatLevel: ThreatLevel;
  score?: number; // e.g., 0-100 safety score
  message: string;
  checkedAt: string;
  details?: {
    protocol?: string;
    hostname?: string;
    ipAddress?: string;
    isHttps?: boolean;
    flags?: string[];
    threatsDetected?: string[];
    responseTimeMs?: number;
  };
  backendSource?: 'live-api' | 'preview-mode';
}

export interface CheckUrlPayload {
  url: string;
}

