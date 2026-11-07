import React from 'react';
import type { UrlCheckResult } from '../types/urlCheck';
import { ShieldCheckIcon, ShieldAlertIcon } from './Icons';
import './RecentChecks.css';

interface RecentChecksProps {
  history: UrlCheckResult[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

export const RecentChecks: React.FC<RecentChecksProps> = ({
  history,
  onSelectUrl,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="recent-checks-wrapper">
      <div className="recent-header">
        <span className="recent-title">Recent Scans ({history.length})</span>
        <button type="button" className="clear-history-btn" onClick={onClearHistory}>
          Clear history
        </button>
      </div>

      <div className="recent-list">
        {history.map((item, index) => {
          const isSecure = item.verdict === 'secure';
          return (
            <div
              key={`${item.url}-${index}`}
              className={`recent-item ${isSecure ? 'item-secure' : 'item-insecure'}`}
              onClick={() => onSelectUrl(item.url)}
              role="button"
              tabIndex={0}
              title={`Click to re-scan ${item.url}`}
            >
              <div className="recent-item-icon">
                {isSecure ? <ShieldCheckIcon size={16} /> : <ShieldAlertIcon size={16} />}
              </div>
              <div className="recent-item-info">
                <span className="recent-item-url">{item.url}</span>
                <span className="recent-item-time">{item.checkedAt}</span>
              </div>
              <span className={`recent-status-badge ${isSecure ? 'badge-safe' : 'badge-danger'}`}>
                {isSecure ? 'Safe' : 'Risk'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
