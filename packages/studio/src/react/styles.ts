export const studioStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }

:host {
  display: block;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --bg: #ffffff;
  --bg-sidebar: #f8f9fa;
  --bg-hover: #e9ecef;
  --bg-active: #dee2e6;
  --text: #212529;
  --text-muted: #6c757d;
  --border: #dee2e6;
  --accent: #4263eb;
  --accent-light: #edf2ff;
  --label-bg: #f1f3f5;
}

:host([data-theme="dark"]) {
  --bg: #1a1b1e;
  --bg-sidebar: #141517;
  --bg-hover: #25262b;
  --bg-active: #2c2e33;
  --text: #c1c2c5;
  --text-muted: #909296;
  --border: #373a40;
  --accent: #748ffc;
  --accent-light: #1e2a4a;
  --label-bg: #25262b;
}

.studio-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 48px 1fr;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.studio-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.studio-header-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.studio-header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.studio-theme-toggle {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.studio-theme-toggle:hover {
  background: var(--bg-hover);
}

.studio-sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 8px 0;
}

.studio-group-title {
  padding: 12px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.studio-component-name {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.studio-story-item {
  display: block;
  width: 100%;
  padding: 5px 16px 5px 28px;
  font-size: 13px;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
  text-decoration: none;
}

.studio-story-item:hover {
  background: var(--bg-hover);
}

.studio-story-item[data-active="true"] {
  background: var(--accent-light);
  color: var(--accent);
}

.studio-main {
  overflow: auto;
  padding: 24px;
}

.studio-preview-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.studio-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
}

.studio-variant-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  text-align: center;
}
`
