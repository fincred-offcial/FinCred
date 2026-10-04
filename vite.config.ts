import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Mocks the Vite HMR client to completely eliminate WebSocket connection attempts and [vite] logs
const mockViteClientPlugin: Plugin = {
  name: 'mock-vite-client',
  enforce: 'pre',
  resolveId(id) {
    if (id === '/@vite/client' || id.endsWith('/vite/dist/client/client.mjs')) {
      return '\0virtual:vite-client';
    }
  },
  load(id) {
    if (id === '\0virtual:vite-client') {
      return `
        export class ErrorOverlay extends HTMLElement {}
        if (typeof customElements !== 'undefined' && !customElements.get('vite-error-overlay')) {
          customElements.define('vite-error-overlay', ErrorOverlay);
        }
        export function updateStyle(id, content) {
          let style = document.getElementById(id);
          if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
          }
          style.textContent = content;
        }
        export function removeStyle(id) {
          const style = document.getElementById(id);
          if (style) document.head.removeChild(style);
        }
        export function injectQuery(url, queryToInject) {
          return url;
        }
        class HotContext {
          constructor(ownerPath) {
            this.ownerPath = ownerPath;
            this.data = {};
          }
          accept(deps, cb) {}
          acceptExports(names, cb) {}
          dispose(cb) {}
          prune(cb) {}
          decline() {}
          invalidate(message) {}
          on(event, cb) {}
          send(event, data) {}
        }
        export function createHotContext(ownerPath) {
          return new HotContext(ownerPath);
        }
      `;
    }
  }
};

const suppressConsoleScript = `(function() {
  var filterMsg = function(args) {
    if (!args || !args.length) return false;
    for (var i = 0; i < args.length; i++) {
      var item = args[i];
      if (!item) continue;
      var str = String(item.message || item.reason || item);
      if (
        str.indexOf('[vite]') !== -1 ||
        str.toLowerCase().indexOf('websocket') !== -1 ||
        str === 'Script error.' ||
        str.indexOf('Failed to fetch') !== -1
      ) {
        return true;
      }
    }
    return false;
  };

  ['log', 'warn', 'error', 'info', 'debug'].forEach(function(method) {
    var orig = console[method];
    console[method] = function() {
      if (filterMsg(arguments)) return;
      orig.apply(console, arguments);
    };
  });

  window.addEventListener('error', function(event) {
    var msg = event ? (event.message || event.error) : '';
    if (filterMsg([msg])) {
      event.preventDefault();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', function(event) {
    var reason = event ? (event.reason || event) : '';
    if (filterMsg([reason])) {
      event.preventDefault();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return true;
    }
  }, true);
})();`;

const suppressScriptPlugin: Plugin = {
  name: 'suppress-console-script',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace('<head>', `<head><script>${suppressConsoleScript}</script>`);
    }
  }
};

export default defineConfig(() => {
  return {
    plugins: [
      mockViteClientPlugin,
      suppressScriptPlugin,
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: {
          id: '/',
          name: 'FinCred – Loan Platform',
          short_name: 'FinCred',
          description: 'FinCred Digital Loan Assistance & Referral Platform',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/app',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
