import React from 'react';
import ReactDOM from 'react-dom/client';
import { TorrentProvider } from './context/TorrentContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TorrentProvider>
      <App />
    </TorrentProvider>
  </React.StrictMode>
);
