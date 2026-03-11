export const WIDGET_CSS = `
:host {
  --qr-fg: #000000;
  --qr-bg: #ffffff;
  --qr-text: #1a1a1a;
  --qr-text-secondary: #6b7280;
  --qr-border: #e5e7eb;
  --qr-error: #dc2626;
  --qr-input-bg: #ffffff;
  --qr-btn-bg: #1a1a1a;
  --qr-btn-text: #ffffff;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

:host([data-theme="dark"]) {
  --qr-fg: #ffffff;
  --qr-bg: #111827;
  --qr-text: #f3f4f6;
  --qr-text-secondary: #9ca3af;
  --qr-border: #374151;
  --qr-error: #f87171;
  --qr-input-bg: #1f2937;
  --qr-btn-bg: #f3f4f6;
  --qr-btn-text: #111827;
}

.qr-widget {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--qr-bg);
  color: var(--qr-text);
  border: 1px solid var(--qr-border);
  box-sizing: border-box;
  max-width: 500px;
  min-width: 150px;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.qr-container svg {
  width: 100%;
  height: auto;
  max-width: var(--qr-size, 200px);
}

.qr-error-box {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--qr-error);
  color: var(--qr-error);
  font-size: 0.8125rem;
}

.qr-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.qr-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--qr-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qr-input {
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--qr-border);
  background: var(--qr-input-bg);
  color: var(--qr-text);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.qr-input:focus {
  border-color: var(--qr-text);
}

.qr-input.has-error {
  border-color: var(--qr-error);
}

.qr-field-error {
  color: var(--qr-error);
  font-size: 0.75rem;
}

.qr-actions {
  display: flex;
  gap: 0.5rem;
}

.qr-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  background: var(--qr-btn-bg);
  color: var(--qr-btn-text);
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  font-family: inherit;
  font-weight: 500;
  text-align: center;
}

.qr-btn:hover {
  opacity: 0.85;
}

.qr-btn:active {
  opacity: 0.7;
}

.qr-footer {
  text-align: center;
  font-size: 0.6875rem;
  color: var(--qr-text-secondary);
}

.qr-footer a {
  color: var(--qr-text-secondary);
  text-decoration: none;
}

.qr-footer a:hover {
  text-decoration: underline;
}

.qr-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--qr-text-secondary);
  font-size: 0.875rem;
}
`;
