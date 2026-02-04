/**
 * HTML for the iframe that renders component previews.
 *
 * Receives RENDER / SET_THEME postMessages from the host.
 * Uses Vite module imports to load the actual .preview.tsx files
 * and render the component with React.
 */
export function getFrameHtml(stylesPath: string | null): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${stylesPath ? `<link rel="stylesheet" href="${stylesPath}" />` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    [data-theme="dark"] { background: #1a1b1e; color: #c1c2c5; }

    .preview-container {
      padding: 16px;
    }

    .preview-row {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .preview-column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .preview-grid {
      display: grid;
    }

    .variant-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .variant-label {
      font-size: 11px;
      color: #6c757d;
      margin-top: 6px;
      text-align: center;
    }

    .error-display {
      padding: 16px;
      background: #fff5f5;
      border: 1px solid #ffc9c9;
      border-radius: 6px;
      color: #c92a2a;
      font-size: 13px;
      font-family: monospace;
      white-space: pre-wrap;
    }

    [data-theme="dark"] .error-display {
      background: #2c1a1a;
      border-color: #6b2a2a;
      color: #ffa8a8;
    }

    [data-theme="dark"] .variant-label {
      color: #909296;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="module">
    import React from '/@modules/react'
    import ReactDOM from '/@modules/react-dom/client'

    // Module cache for loaded preview files
    const moduleCache = new Map();

    let currentRoot = null;

    // Listen for messages from host
    window.addEventListener('message', async (event) => {
      const data = event.data;
      if (!data || !data.type) return;

      switch (data.type) {
        case 'RENDER':
          await renderPreview(data);
          break;
        case 'SET_THEME':
          document.documentElement.dataset.theme = data.theme;
          document.body.dataset.theme = data.theme;
          break;
      }
    });

    async function renderPreview(data) {
      const { component, preview, filePath, variants, layout, theme } = data;

      // Set theme
      document.documentElement.dataset.theme = theme;
      document.body.dataset.theme = theme;

      const root = document.getElementById('root');

      try {
        // Dynamically import the preview file through Vite
        const mod = await loadModule(filePath);
        if (!mod) {
          root.innerHTML = '<div class="error-display">Failed to load preview module: ' + filePath + '</div>';
          return;
        }

        // Find the exported preview
        const previewExport = mod[preview];
        if (!previewExport) {
          root.innerHTML = '<div class="error-display">Export "' + preview + '" not found in ' + filePath + '</div>';
          return;
        }

        // If it's a React component, render it directly
        if (typeof previewExport === 'function' || (previewExport && previewExport.$$typeof)) {
          renderComponent(root, previewExport);
          return;
        }

        // If it has __type === 'preview', render variants
        if (previewExport.__type === 'preview') {
          renderVariants(root, previewExport, layout);
          return;
        }

        // Fallback: try rendering as component
        root.innerHTML = '<div class="error-display">Unknown export type for "' + preview + '"</div>';
      } catch (err) {
        root.innerHTML = '<div class="error-display">' + escapeHtml(err.message) + '\\n' + escapeHtml(err.stack || '') + '</div>';
      }
    }

    async function loadModule(filePath) {
      try {
        // Import through Vite's dev server
        const mod = await import('/' + filePath);
        return mod;
      } catch (err) {
        console.error('[frame] Failed to load module:', filePath, err);
        return null;
      }
    }

    function renderVariants(rootEl, previewData, layout) {
      const { component: Component, variants, layout: previewLayout } = previewData;
      const finalLayout = layout || previewLayout || { type: 'row', gap: 16 };

      const containerStyle = getLayoutStyle(finalLayout);

      const elements = variants.map((variant, i) =>
        React.createElement('div', { className: 'variant-wrapper', key: i },
          React.createElement(ErrorBoundary, null,
            React.createElement(Component, variant.props)
          ),
          React.createElement('span', { className: 'variant-label' }, variant.label)
        )
      );

      const container = React.createElement('div', {
        className: 'preview-container preview-' + finalLayout.type,
        style: containerStyle,
      }, ...elements);

      if (!currentRoot) {
        currentRoot = ReactDOM.createRoot(rootEl);
      }
      currentRoot.render(container);
    }

    function renderComponent(rootEl, Component) {
      if (!currentRoot) {
        currentRoot = ReactDOM.createRoot(rootEl);
      }
      currentRoot.render(
        React.createElement(ErrorBoundary, null,
          React.createElement(Component)
        )
      );
    }

    function getLayoutStyle(layout) {
      const gap = layout.gap ?? 16;
      switch (layout.type) {
        case 'row':
          return { display: 'flex', gap: gap + 'px', alignItems: 'flex-start', flexWrap: 'wrap' };
        case 'column':
          return { display: 'flex', flexDirection: 'column', gap: gap + 'px', alignItems: 'flex-start' };
        case 'grid':
          return {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + (layout.columns || 3) + ', 1fr)',
            gap: gap + 'px',
          };
        default:
          return { display: 'flex', gap: gap + 'px' };
      }
    }

    // Error boundary as a class component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }

      static getDerivedStateFromError(error) {
        return { error };
      }

      render() {
        if (this.state.error) {
          return React.createElement('div', { className: 'error-display' },
            this.state.error.message
          );
        }
        return this.props.children;
      }
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`
}
