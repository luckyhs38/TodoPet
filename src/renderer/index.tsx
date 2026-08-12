import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { SettingsPanel } from './components/SettingsPanel';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Renderer root element was not found.');
}

const isSettingsView =
  new URLSearchParams(window.location.search).get('view') === 'settings';

createRoot(rootElement).render(
  <StrictMode>
    {isSettingsView ? <SettingsPanel /> : <App />}
  </StrictMode>,
);
