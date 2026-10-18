import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { PlaybackProvider } from './contexts/PlaybackContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <PlaybackProvider>
        <App />
      </PlaybackProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);
