interface HostHtmlOptions {
  breakpoints: Record<string, number>
  port: number
}

export function getHostHtml(options: HostHtmlOptions): string {
  const { breakpoints, port } = options

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
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

    [data-theme="dark"] {
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

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      overflow: hidden;
    }

    .layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      grid-template-rows: 48px 1fr;
      height: 100vh;
    }

    /* Header */
    .header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }

    .header-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breakpoint-group {
      display: flex;
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .breakpoint-btn {
      padding: 4px 10px;
      font-size: 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s;
    }

    .breakpoint-btn:hover {
      background: var(--bg-hover);
    }

    .breakpoint-btn.active {
      background: var(--accent);
      color: #fff;
    }

    .breakpoint-btn + .breakpoint-btn {
      border-left: 1px solid var(--border);
    }

    .theme-toggle {
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

    .theme-toggle:hover {
      background: var(--bg-hover);
    }

    .scale-indicator {
      font-size: 11px;
      color: var(--text-muted);
      min-width: 40px;
      text-align: right;
    }

    /* Sidebar */
    .sidebar {
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 8px 0;
    }

    .sidebar-section {
      margin-bottom: 4px;
    }

    .sidebar-component {
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: capitalize;
    }

    .sidebar-item {
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

    .sidebar-item:hover {
      background: var(--bg-hover);
    }

    .sidebar-item.active {
      background: var(--accent-light);
      color: var(--accent);
    }

    /* Main content */
    .main {
      overflow: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .preview-title {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 16px;
      align-self: flex-start;
    }

    .iframe-wrapper {
      position: relative;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg);
      transition: width 0.3s ease;
    }

    .iframe-wrapper iframe {
      display: block;
      width: 100%;
      height: 400px;
      border: none;
    }

    .variant-labels {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .variant-label {
      font-size: 11px;
      padding: 2px 8px;
      background: var(--label-bg);
      border-radius: 4px;
      color: var(--text-muted);
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-muted);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="layout">
    <header class="header">
      <span class="header-title">Studio</span>
      <div class="header-controls">
        <div class="breakpoint-group" id="breakpoints"></div>
        <span class="scale-indicator" id="scale-indicator"></span>
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
          <span id="theme-icon">&#9788;</span>
        </button>
      </div>
    </header>
    <nav class="sidebar" id="sidebar"></nav>
    <main class="main" id="main">
      <div class="empty-state">Select a component preview</div>
    </main>
  </div>

  <script>
    const BREAKPOINTS = ${JSON.stringify(breakpoints)};
    const PORT = ${port};

    let state = {
      components: [],
      activeComponent: null,
      activePreview: null,
      breakpoint: null,
      theme: 'light',
      scale: 1,
    };

    // --- Init ---
    async function init() {
      await fetchComponents();
      initBreakpoints();
      initTheme();
      parseUrl();
      connectSSE();
    }

    // --- Data ---
    async function fetchComponents() {
      const res = await fetch('/api/components');
      state.components = await res.json();
      renderSidebar();
    }

    // --- SSE ---
    function connectSSE() {
      const es = new EventSource('/events');
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'registry_updated') {
          state.components = data.components;
          renderSidebar();
          if (state.activeComponent && state.activePreview) {
            renderPreview();
          }
        }
      };
    }

    // --- Breakpoints ---
    function initBreakpoints() {
      const container = document.getElementById('breakpoints');
      const names = Object.keys(BREAKPOINTS);

      // "Auto" option (no constraint)
      const autoBtn = document.createElement('button');
      autoBtn.className = 'breakpoint-btn active';
      autoBtn.textContent = 'Auto';
      autoBtn.onclick = () => selectBreakpoint(null);
      container.appendChild(autoBtn);

      for (const name of names) {
        const btn = document.createElement('button');
        btn.className = 'breakpoint-btn';
        btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        btn.dataset.bp = name;
        btn.onclick = () => selectBreakpoint(name);
        container.appendChild(btn);
      }
    }

    function selectBreakpoint(name) {
      state.breakpoint = name;
      document.querySelectorAll('.breakpoint-btn').forEach(b => {
        b.classList.toggle('active',
          name === null ? b.textContent === 'Auto' : b.dataset.bp === name
        );
      });
      updateIframeSize();
    }

    function updateIframeSize() {
      const wrapper = document.querySelector('.iframe-wrapper');
      if (!wrapper) return;

      const indicator = document.getElementById('scale-indicator');

      if (!state.breakpoint) {
        wrapper.style.width = '100%';
        wrapper.style.transform = '';
        wrapper.style.transformOrigin = '';
        indicator.textContent = '';
        state.scale = 1;
        return;
      }

      const bpWidth = BREAKPOINTS[state.breakpoint];
      const available = document.getElementById('main').clientWidth - 48;
      const scale = Math.min(1, available / bpWidth);

      wrapper.style.width = bpWidth + 'px';

      if (scale < 1) {
        wrapper.style.transform = 'scale(' + scale + ')';
        wrapper.style.transformOrigin = 'top left';
        indicator.textContent =
          state.breakpoint.charAt(0).toUpperCase() + state.breakpoint.slice(1) +
          ' ' + bpWidth + 'px  ' + Math.round(scale * 100) + '%';
      } else {
        wrapper.style.transform = '';
        indicator.textContent =
          state.breakpoint.charAt(0).toUpperCase() + state.breakpoint.slice(1) +
          ' ' + bpWidth + 'px';
      }

      state.scale = scale;
    }

    // --- Theme ---
    function initTheme() {
      document.getElementById('theme-toggle').onclick = toggleTheme;
    }

    function toggleTheme() {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = state.theme;
      document.getElementById('theme-icon').innerHTML =
        state.theme === 'light' ? '&#9788;' : '&#9790;';

      // Notify iframe
      const iframe = document.querySelector('.iframe-wrapper iframe');
      if (iframe) {
        iframe.contentWindow.postMessage(
          { type: 'SET_THEME', theme: state.theme },
          '*'
        );
      }
    }

    // --- URL sync ---
    function parseUrl() {
      const path = window.location.pathname;
      const match = path.match(/^\\/([a-z0-9-]+)\\/([A-Za-z0-9]+)$/);
      if (match) {
        state.activeComponent = match[1];
        state.activePreview = match[2];
        renderPreview();
        highlightSidebar();
      }
    }

    function pushUrl(component, preview) {
      const url = '/' + component + '/' + preview;
      window.history.pushState(null, '', url);
    }

    window.onpopstate = parseUrl;

    // --- Sidebar ---
    function renderSidebar() {
      const sidebar = document.getElementById('sidebar');
      sidebar.innerHTML = '';

      for (const comp of state.components) {
        const section = document.createElement('div');
        section.className = 'sidebar-section';

        const title = document.createElement('div');
        title.className = 'sidebar-component';
        title.textContent = comp.name;
        section.appendChild(title);

        for (const preview of comp.previews) {
          const item = document.createElement('a');
          item.className = 'sidebar-item';
          item.href = '/' + comp.name + '/' + preview.name;
          item.textContent = preview.name;
          item.dataset.component = comp.name;
          item.dataset.preview = preview.name;
          item.onclick = (e) => {
            e.preventDefault();
            selectPreview(comp.name, preview.name);
          };
          section.appendChild(item);
        }

        sidebar.appendChild(section);
      }

      highlightSidebar();
    }

    function highlightSidebar() {
      document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active',
          item.dataset.component === state.activeComponent &&
          item.dataset.preview === state.activePreview
        );
      });
    }

    // --- Preview ---
    function selectPreview(component, preview) {
      state.activeComponent = component;
      state.activePreview = preview;
      pushUrl(component, preview);
      highlightSidebar();
      renderPreview();
    }

    function renderPreview() {
      const main = document.getElementById('main');
      const comp = state.components.find(c => c.name === state.activeComponent);
      if (!comp) {
        main.innerHTML = '<div class="empty-state">Component not found</div>';
        return;
      }

      const preview = comp.previews.find(p => p.name === state.activePreview);
      if (!preview) {
        main.innerHTML = '<div class="empty-state">Preview not found</div>';
        return;
      }

      const title = document.createElement('div');
      title.className = 'preview-title';
      title.textContent = comp.name + ' / ' + preview.name;

      const wrapper = document.createElement('div');
      wrapper.className = 'iframe-wrapper';

      const iframe = document.createElement('iframe');
      iframe.src = '/frame';
      wrapper.appendChild(iframe);

      const labels = document.createElement('div');
      labels.className = 'variant-labels';
      for (const variant of preview.variants) {
        const label = document.createElement('span');
        label.className = 'variant-label';
        label.textContent = variant.label;
        labels.appendChild(label);
      }

      main.innerHTML = '';
      main.appendChild(title);
      main.appendChild(wrapper);
      main.appendChild(labels);

      // Send render data to iframe once loaded
      iframe.onload = () => {
        iframe.contentWindow.postMessage({
          type: 'RENDER',
          component: state.activeComponent,
          preview: state.activePreview,
          filePath: comp.filePath,
          variants: preview.variants,
          layout: preview.layout,
          theme: state.theme,
        }, '*');
      };

      updateIframeSize();
    }

    // --- Resize observer ---
    new ResizeObserver(() => updateIframeSize())
      .observe(document.getElementById('main'));

    init();
  </script>
</body>
</html>`
}
