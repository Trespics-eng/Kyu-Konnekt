import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';

window.addEventListener('error', (event) => {
  console.error('[KyU frontend uncaught error]', { message: event.message, file: event.filename, line: event.lineno, column: event.colno, error: event.error });
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[KyU frontend unhandled promise rejection]', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary><BrowserRouter><App /></BrowserRouter></ErrorBoundary>
  </React.StrictMode>,
);
