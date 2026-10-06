import React from 'react';
import ReactDOM from 'react-dom/client';
import { CrucibleProvider } from './context/CrucibleContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CrucibleProvider>
      <App />
    </CrucibleProvider>
  </React.StrictMode>
);
