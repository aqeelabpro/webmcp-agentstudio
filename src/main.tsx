import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { initWebMCPPolyfill } from './lib/webmcp/modelContextPolyfill';

// Eager initialize WebMCP Polyfill / Bridge on document.modelContext
initWebMCPPolyfill();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
