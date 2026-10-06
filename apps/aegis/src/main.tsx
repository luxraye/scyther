import React from 'react';
import ReactDOM from 'react-dom/client';
import { AegisProvider } from './context/AegisContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AegisProvider>
      <App />
    </AegisProvider>
  </React.StrictMode>
);
