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

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const { data } = await vehiclesAPI.getVehicleById(id);
      setVehicle(data);
    } catch (error) {
      console.error("Erreur:", error);
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxImage(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setLightboxImage((prev) => (prev + 1) % vehicleImages.length);
  };

  const prevImage = () => {
    setLightboxImage((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);
  };

  const handleAddToCart = () => {
    addToCart(vehicle);
    // Optionnel : Afficher une notification de succès
    alert("Véhicule ajouté au panier avec succès !");
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showLightbox) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox]);

  if (loading) return <Loader />;
  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h2>
          <button
            onClick={() => navigate("/vehicles")}
            className="text-blue-600 hover:underline"
          >
            Retour aux véhicules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[116px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/vehicles")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Retour aux véhicules</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Section Images */}
          <div className="p-6">
            {/* Image principale */}
            <div className="relative mb-4 group">
              <div 
                className="relative h-96 rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
                onClick={() => openLightbox(selectedImage)}
              >
                <img
                  src={vehicleImages[selectedImage]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay avec icône zoom */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Badge disponibilité */}
                {!vehicle.available && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    Indisponible
                  </div>
                )}

                {/* Badge type */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  {vehicle.type === 'electric' && '⚡ Électrique'}
                  {vehicle.type === 'hybrid' && '🔋 Hybride'}
                  {vehicle.type === 'thermal' && '⛽ Thermique'}
                </div>

                {/* Bouton favori */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiked(!liked);
                  }}
                  className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart
                    size={24}
                    className={liked ? "fill-red-500 text-red-500" : "text-gray-600"}
                  />
                </button>
              </div>
            </div>

            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-3">
              {vehicleImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage === index
                      ? 'ring-4 ring-blue-600 scale-105'
                      : 'ring-2 ring-gray-200 hover:ring-blue-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-blue-600/20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Informations */}
          <div className="p-6 lg:p-8">
            {/* En-tête */}
            <div className="mb-6 pb-6 border-b-2 border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    {vehicle.brand}
                  </p>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {vehicle.model}
                  </h1>
                </div>
              </div>

              {/* Note et avis */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(vehicle.rating || 4)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {vehicle.rating || 4.5} ({vehicle.reviews || 128} avis)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {vehicle.description || 
                  `Découvrez ce magnifique ${vehicle.brand} ${vehicle.model}, un véhicule d'exception qui allie performance, confort et technologie de pointe. Idéal pour tous vos déplacements.`
                }
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-blue-600 text-sm font-semibold mb-1">Année</p>
                <p className="text-2xl font-bold text-gray-900">{vehicle.year}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-green-600 text-sm font-semibold mb-1">Kilométrage</p>
                <p className="text-2xl font-bold text-gray-900">{vehicle.mileage} km</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <p className="text-purple-600 text-sm font-semibold mb-1">Carburant</p>
                <p className="text-2xl font-bold text-gray-900">{vehicle.fuel || "Essence"}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <p className="text-orange-600 text-sm font-semibold mb-1">Transmission</p>
                <p className="text-2xl font-bold text-gray-900">{vehicle.transmission || "Auto"}</p>
              </div>
            </div>

            {/* Prix et Action */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 mb-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-1">Prix</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatPrice(vehicle.price)}
                </p>
                <p className="text-gray-500 text-sm mt-1">TTC, tous frais inclus</p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <ShoppingCart size={24} />
                <span>Ajouter au panier</span>
              </button>
            </div>

            {/* Avantages */}
            <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Nos avantages
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-blue-800">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Garantie 12 mois incluse</span>
                </li>
                <li className="flex items-center gap-3 text-blue-800">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Service client 24/7</span>
                </li>
                <li className="flex items-center gap-3 text-blue-800">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Livraison gratuite</span>
                </li>
                <li className="flex items-center gap-3 text-blue-800">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Retour sous 14 jours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Bouton fermer */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          {/* Compteur */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold">
            {lightboxImage + 1} / {vehicleImages.length}
          </div>

          {/* Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={vehicleImages[lightboxImage]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>

          {/* Bouton précédent */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          {/* Bouton suivant */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Miniatures */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {vehicleImages.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(index);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  lightboxImage === index
                    ? 'ring-4 ring-white scale-110'
                    : 'ring-2 ring-white/50 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Vue ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}