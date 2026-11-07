import React, { useState } from 'react';
import type { UrlCheckResult } from '../types/urlCheck';
import { 
  ShieldCheckIcon, 
  ShieldAlertIcon, 
  LockIcon, 
  UnlockIcon, 
  ExternalLinkIcon,
  ClipboardIcon
} from './Icons';
import './SecurityResultCard.css';

interface SecurityResultCardProps {
  result: UrlCheckResult;
  onClear: () => void;
  onRescan: (url: string) => void;
  isLoading: boolean;
}

export const SecurityResultCard: React.FC<SecurityResultCardProps> = ({
  result,
  onClear,
  onRescan,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const isSecure = result.verdict === 'secure';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className={`result-card-container ${isSecure ? 'card-secure' : 'card-insecure'}`}>
      {/* Top Banner indicating mode */}
      {result.backendSource === 'preview-mode' && (
        <div className="preview-mode-banner">
          <span className="preview-badge">Demo Mode</span>
          <span>Backend not reachable yet — showing client-side simulation. Point your POST request to connect.</span>
        </div>
      )}

      {result.backendSource === 'live-api' && (
        <div className="live-api-banner">
          <span className="live-badge">Live Backend Verified</span>
          <span>Checked in {result.details?.responseTimeMs ?? 50}ms via API.</span>
        </div>
      )}

      {/* Main Verdict Header */}
      <div className="card-header">
        <div className="status-icon-wrapper">
          {isSecure ? <ShieldCheckIcon size={36} /> : <ShieldAlertIcon size={36} />}
        </div>

        <div className="status-text-group">
          <div className="verdict-tag-row">
            <span className={`verdict-pill ${isSecure ? 'pill-secure' : 'pill-insecure'}`}>
              {isSecure ? 'SECURE' : 'INSECURE / SUSPICIOUS'}
            </span>
            <span className="threat-level-tag">
              Threat Level: <strong>{result.threatLevel.toUpperCase()}</strong>
            </span>
          </div>
          <h2 className="verdict-heading">
            {isSecure ? 'This URL appears safe to navigate' : 'Warning: Security risk detected'}
          </h2>
          <p className="verdict-message">{result.message}</p>
        </div>

        {/* Score indicator */}
        {result.score !== undefined && (
          <div className="score-box">
            <div className={`score-number ${isSecure ? 'score-high' : 'score-low'}`}>
              {result.score}
            </div>
            <div className="score-label">Safety Score</div>
          </div>
        )}
      </div>

      {/* Target URL Info Bar */}
      <div className="target-url-bar">
        <div className="target-url-info">
          <span className="url-protocol-icon">
            {result.details?.isHttps ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
          </span>
          <span className="target-url-text" title={result.url}>
            {result.url}
          </span>
        </div>

        <div className="target-url-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleCopyUrl}
            title="Copy URL"
          >
            <ClipboardIcon size={15} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <a
            href={result.url.startsWith('http') ? result.url : `https://${result.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-btn external-link-btn"
            title="Visit URL in new tab (use caution for insecure links)"
          >
            <ExternalLinkIcon size={15} />
            <span>Visit</span>
          </a>
        </div>
      </div>

      {/* Technical Inspection Details */}
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-title">Protocol</span>
          <span className={`detail-value ${result.details?.isHttps ? 'val-safe' : 'val-warn'}`}>
            {result.details?.protocol || (result.url.startsWith('https') ? 'HTTPS (Encrypted)' : 'HTTP (Unencrypted)')}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-title">Target Host / Domain</span>
          <span className="detail-value mono-val">
            {result.details?.hostname || 'Unknown host'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-title">Checked At</span>
          <span className="detail-value">
            {result.checkedAt}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-title">Transport Security</span>
          <span className={`detail-value ${result.details?.isHttps ? 'val-safe' : 'val-warn'}`}>
            {result.details?.isHttps ? 'SSL/TLS Active' : 'No TLS Encryption'}
          </span>
        </div>
      </div>

      {/* Flags & Threats list */}
      {result.details?.flags && result.details.flags.length > 0 && (
        <div className="flags-section">
          <span className="flags-label">Security Checks & Flags:</span>
          <div className="flags-pills">
            {result.details.flags.map((flag, idx) => (
              <span key={idx} className={`flag-pill ${isSecure ? 'flag-ok' : 'flag-warn'}`}>
                {isSecure ? '✓' : '⚠'} {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="card-footer">
        <button
          type="button"
          className="action-link-btn"
          onClick={() => onRescan(result.url)}
          disabled={isLoading}
        >
          {isLoading ? 'Scanning...' : '↻ Re-scan this URL'}
        </button>

        <button
          type="button"
          className="action-link-btn clear-card-btn"
          onClick={onClear}
        >
          Dismiss result
        </button>
      </div>
    </div>
  );
};
