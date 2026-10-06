import React from 'react';
import ReactDOM from 'react-dom/client';
import { RubricProvider } from './context/RubricContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RubricProvider>
      <App />
    </RubricProvider>
  </React.StrictMode>
);
