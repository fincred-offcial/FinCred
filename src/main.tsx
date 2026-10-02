import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with error handling for sandbox/iframe environments
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol === 'https:') {
    registerSW({
      immediate: true,
      onRegisterError(error) {
        // Benign in dev or sandboxed environments
        console.warn('PWA registration skipped in sandbox:', error);
      }
    });
  }
} catch {
  // Graceful fallback for restricted iframe execution contexts
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
