import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Ignorer les erreurs d'extensions Chrome qui ne sont pas critiques
    const errorMessage = error?.message || error?.toString() || '';
    const isExtensionError = 
      errorMessage.includes('removeChild') ||
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('extension') ||
      errorMessage.includes('content-script') ||
      errorMessage.includes('chrome-extension');
    
    if (isExtensionError) {
      console.warn('Erreur d\'extension ignorée:', errorMessage);
      return { hasError: false };
    }
    
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Ignorer les erreurs d'extensions
    const errorMessage = error?.message || error?.toString() || '';
    const isExtensionError = 
      errorMessage.includes('removeChild') ||
      errorMessage.includes('insertBefore') ||
      errorMessage.includes('extension') ||
      errorMessage.includes('content-script') ||
      errorMessage.includes('chrome-extension');
    
    if (isExtensionError) {
      console.warn('Erreur d\'extension Chrome ignorée');
      this.setState({ hasError: false });
      return;
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 mb-8">
              Nous nous excusons pour ce désagrément. Veuillez recharger la page pour continuer.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Recharger la page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;