import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker only in production environment to keep dev environment fully responsive and caching-free
if ((import.meta as any).env?.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('BDFCPS Service Worker registered successfully in production:', registration.scope);
      })
      .catch((err) => {
        console.warn('BDFCPS Service Worker registration failed:', err);
      });
  });
}
