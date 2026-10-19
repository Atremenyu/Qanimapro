import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { preloadPopularFonts } from './utils/googleFonts.ts';
import './index.css';

// Preload popular Google Fonts for zero-latency font switching
preloadPopularFonts();

// Register Service Worker with automatic update detection
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    // Limpiar caches heredadas antiguas para evitar plantillas obsoletas
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key === 'vectormotion-cache-v1') {
            caches.delete(key);
          }
        });
      });
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Verificar actualizaciones periódicamente y en cada visita
        reg.update();

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuevo contenido disponible, forzar activación
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

