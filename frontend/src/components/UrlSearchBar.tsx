import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { SearchIcon, LinkIcon, ClipboardIcon, ClearIcon, LoaderIcon, AlertCircleIcon } from './Icons';
import './UrlSearchBar.css';

interface UrlSearchBarProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  { label: 'Secure HTTPS', url: 'https://github.com', type: 'safe' },
  { label: 'Major Search', url: 'https://www.google.com', type: 'safe' },
  { label: 'Unencrypted HTTP', url: 'http://testphp.vulnweb.com', type: 'danger' },
  { label: 'Suspicious Domain', url: 'http://free-crypto-login-verify.xyz', type: 'danger' },
];

export const UrlSearchBar: React.FC<UrlSearchBarProps> = ({ onSearch, isLoading }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setValidationError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setValidationError(null);
      }
    } catch {
      // Clipboard API might be blocked by browser permission
      const manual = prompt('Paste your URL here:');
      if (manual) {
        setUrlInput(manual.trim());
        setValidationError(null);
      }
    }
  };

  const validateUrl = (rawUrl: string): boolean => {
    if (!rawUrl.trim()) {
      setValidationError('Please enter or paste a URL to scan.');
      return false;
    }

    // Basic URL pattern check (allows with or without http/https)
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
    const ipPattern = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/i;

    if (!urlPattern.test(rawUrl.trim()) && !ipPattern.test(rawUrl.trim())) {
      setValidationError('Please enter a valid web URL (e.g., https://example.com).');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (validateUrl(trimmed)) {
      onSearch(trimmed);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    setValidationError(null);
    onSearch(sampleUrl);
  };

  return (
    <div className="search-tab-wrapper">
      <form className={`search-form ${validationError ? 'has-error' : ''}`} onSubmit={handleSubmit}>
        <div className="search-input-container">
          <span className="search-icon-left" aria-hidden="true">
            <LinkIcon size={20} />
          </span>

          <input
            type="text"
            className="search-input"
            placeholder="Paste target URL here (e.g. https://example.com)..."
            value={urlInput}
            onChange={handleInputChange}
            disabled={isLoading}
            autoFocus
            spellCheck={false}
            autoCapitalize="none"
          />

          <div className="search-input-actions">
            {urlInput && (
              <button
                type="button"
                className="action-btn clear-btn"
                onClick={handleClear}
                title="Clear input"
                disabled={isLoading}
              >
                <ClearIcon size={16} />
              </button>
            )}

            <button
              type="button"
              className="action-btn paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
              disabled={isLoading}
            >
              <ClipboardIcon size={16} />
              <span className="btn-label-text">Paste</span>
            </button>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !urlInput.trim()}
          >
            {isLoading ? (
              <>
                <LoaderIcon size={18} />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <SearchIcon size={18} />
                <span>Scan URL</span>
              </>
            )}
          </button>
        </div>
      </form>

      {validationError && (
        <div className="validation-error-msg">
          <AlertCircleIcon size={16} />
          <span>{validationError}</span>
        </div>
      )}

      <div className="sample-urls-container">
        <span className="sample-label">Try test URLs:</span>
        <div className="sample-chips">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className={`sample-chip chip-${sample.type}`}
              onClick={() => handleSampleClick(sample.url)}
              disabled={isLoading}
            >
              <span className="chip-indicator"></span>
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
