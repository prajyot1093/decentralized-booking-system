import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Ensure React is available globally for any legacy code fragments referencing `React` without import
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-underscore-dangle
  window.React = React;
  if (process.env.REACT_APP_PERF_MODE === '1') {
    document.body.classList.add('perf-mode');
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);