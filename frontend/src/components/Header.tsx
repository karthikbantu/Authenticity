import React from 'react';
import { ShieldCheckIcon } from './Icons';
import './Header.css';

interface HeaderProps {
  apiEndpoint: string;
}

export const Header: React.FC<HeaderProps> = ({ apiEndpoint }) => {
  return (
    <header className="app-header">
      <div className="header-badge">
        <span className="pulse-dot"></span>
        <span>Security Scanner v1.0</span>
      </div>

      <div className="header-title-row">
        <div className="header-icon-box">
          <ShieldCheckIcon size={28} />
        </div>
        <h1 className="header-title">URL Security Inspector</h1>
      </div>

      <p className="header-subtitle">
        Paste any URL to scan for phishing, malicious links, and SSL verification before you click.
      </p>

      <div className="backend-info-pill" title={`Connected endpoint: ${apiEndpoint}`}>
        <span className="api-tag">POST</span>
        <code className="api-path">{apiEndpoint}</code>
      </div>
    </header>
  );
};

