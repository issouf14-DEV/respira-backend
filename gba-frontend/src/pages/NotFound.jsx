import { Link } from 'react-router-dom';
import { Home, Car, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Icône d'erreur animée */}
        <div className="relative inline-block mb-8">
          <AlertCircle className="w-32 h-32 text-red-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-white">404</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-6">
          Oups !
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Page introuvable
        </h2>
        
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          La page que vous recherchez semble avoir pris la route. 
          <br className="hidden md:block" />
          Retournons ensemble vers nos véhicules premium !
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Retour à l'accueil
          </Link>
          
          <Link
            to="/vehicles"
            className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur text-white border-2 border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all transform hover:scale-105"
          >
            <Car className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Voir nos véhicules
          </Link>
        </div>

        {/* Décoration */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;