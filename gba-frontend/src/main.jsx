import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './config/axios.js' // Importer la configuration axios

// Gestionnaire d'erreurs global pour ignorer les erreurs d'extensions Chrome
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  const isExtensionError = 
    errorMessage.includes('removeChild') ||
    errorMessage.includes('insertBefore') ||
    errorMessage.includes('extension') ||
    errorMessage.includes('content-script') ||
    event.filename?.includes('extension');
  
  if (isExtensionError) {
    event.preventDefault();
    console.warn('Erreur d\'extension Chrome ignorée');
    return true;
  }
});

// Ignorer les rejets de promesses d'extensions
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  if (reason.includes('extension') || reason.includes('chrome-extension')) {
    event.preventDefault();
    console.warn('Promesse d\'extension ignorée');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)