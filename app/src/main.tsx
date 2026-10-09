import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App.tsx';
import './styles.css';

// Ask the browser to keep IndexedDB (no eviction under storage pressure).
void navigator.storage?.persist?.().catch(() => false);

const perbarui = registerSW({
  onNeedRefresh() { dispatchEvent(new CustomEvent('hnc:versi-baru', { detail: () => void perbarui(true) })); },
});

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
