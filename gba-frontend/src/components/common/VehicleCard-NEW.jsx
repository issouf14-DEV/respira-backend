import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { carImages, getRandomCarImage } from "../../assets/carImages";

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Obtenir une image fiable
  const getVehicleImage = () => {
    if (vehicle.image && !imageError) {
      return vehicle.image;
    }
    // Fallback vers une image de carImages basée sur le type de véhicule
    if (vehicle.type === 'electric') return carImages.electric1;
    if (vehicle.type === 'suv') return carImages.suv1;
    if (vehicle.type === 'luxury') return carImages.luxury1;
    if (vehicle.type === 'sport') return carImages.sport1;
    return getRandomCarImage();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleClick = () => {
    navigate(`/vehicles/${vehicle._id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
         onClick={handleClick}>
      {/* Container d'image avec placeholder */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {/* Placeholder animé pendant le chargement */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
        )}

        {/* Image principale */}
        <img
          src={getVehicleImage()}
          alt={`${vehicle.brand} ${vehicle.model}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Badge disponibilité */}
        {!vehicle.available && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-sm">
            Indisponible
          </div>
        )}

        {/* Badge nouveau */}
        {vehicle.isNew && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-sm">
            Nouveau
          </div>
        )}

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
            <div className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-lg">
              👁️ Voir les détails
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-gray-600 text-sm">
            {vehicle.year} • {vehicle.transmission || 'Automatique'}
          </p>
        </div>

        {/* Caractéristiques */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">⚡</span>
            <span className="text-gray-600">
              {vehicle.type === 'electric' ? 'Électrique' : 
               vehicle.type === 'hybrid' ? 'Hybride' : 'Thermique'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">👥</span>
            <span className="text-gray-600">{vehicle.seats || '5'} places</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-600">🎯</span>
            <span className="text-gray-600">{vehicle.category || 'Berline'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">📍</span>
            <span className="text-gray-600">{vehicle.location || 'Abidjan'}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {vehicle.pricePerDay ? `${vehicle.pricePerDay.toLocaleString()} FCFA` : 'Prix sur demande'}
            </span>
            <span className="text-gray-500 text-sm">/ jour</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vehicles/${vehicle._id}`);
            }}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Réserver
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Action pour ajouter aux favoris
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}