import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehiclesAPI } from "../api/vehicles";
import { CartContext } from "../context/CartContext";
import Loader from "../components/common/Loading";
import { ShoppingCart, ArrowLeft, Star, Heart, Calendar, Gauge, Fuel, Settings } from "lucide-react";
import { formatPrice } from "../utils/helpers";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const getDemoVehicles = () => [
    {
      id: 1,
      name: 'Volkswagen Golf GTI',
      brand: 'Volkswagen',
      model: 'Golf GTI',
      type: 'thermal',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1622353219448-46a8f44ce528?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '245 ch',
      description: 'Golf GTI sportive et polyvalente.',
      rating: 5,
      reviews: 12
    },
    {
      id: 2,
      name: 'Volkswagen Touareg R',
      brand: 'Volkswagen',
      model: 'Touareg R',
      type: 'hybrid',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Hybride',
      mileage: 0,
      power: '462 ch',
      description: 'SUV premium hybride rechargeable avec performances exceptionnelles.',
      rating: 5,
      reviews: 8
    },
    {
      id: 3,
      name: 'Volkswagen ID.4',
      brand: 'Volkswagen',
      model: 'ID.4',
      type: 'electric',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0,
      power: '204 ch',
      description: 'SUV 100% électrique avec 520 km d\'autonomie.',
      rating: 5,
      reviews: 15
    }
  ];

  const fetchVehicle = async () => {
    try {
      const data = await vehiclesAPI.getById(id);
      if (!data || Object.keys(data).length === 0) {
        // Fallback démo
        const local = getDemoVehicles().find(v => v.id == id || v._id == id);
        if (local) {
          setVehicle(local);
        } else {
          setVehicle(null);
        }
      } else {
        setVehicle(data);
      }
    } catch (error) {
      // Fallback démo
      const local = getDemoVehicles().find(v => v.id == id || v._id == id);
      if (local) {
        setVehicle(local);
      } else {
        setVehicle(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!vehicle) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/vehicles")}
  className="flex items-center space-x-2 text-red-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Véhicule non trouvé</h2>
        <p className="text-gray-600">Ce véhicule n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/vehicles")}
  className="flex items-center space-x-2 text-red-600 hover:underline mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span>Retour aux véhicules</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative mb-4 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl shadow-xl h-96 overflow-hidden">
            <img
              src={vehicle.image || "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?w=800"}
              alt={vehicle.model || vehicle.name}
              className="max-h-80 rounded-lg object-contain mx-auto"
            />
            <button
              onClick={() => setLiked(!liked)}
              className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <Heart
                size={24}
                className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </button>
            {/* Badge année */}
            <span className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {vehicle.year || 2024}
            </span>
            {/* Badge kilométrage */}
            <span className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {vehicle.mileage === 0 || !vehicle.mileage ? 'Neuf • 0 km' : `${vehicle.mileage} km`}
            </span>
          </div>
          <div className="flex gap-3 justify-center mt-5">
            {[...Array(4)].map((_, i) => (
              <img
                key={i}
                src={vehicle.image || "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?w=800"}
                alt="vignette"
                className="w-20 h-16 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-500 transition shadow-sm"
              />
            ))}
          </div>
        </div>

        {/* Infos */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              {vehicle.brand} {vehicle.model}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(vehicle.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">({vehicle.reviews || 0} avis)</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              {vehicle.description || 'Véhicule disponible à la vente.'}
            </p>
          </div>

          {/* Caractéristiques */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 rounded-xl p-5 text-center shadow-sm border border-red-100">
              <Calendar className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-1">Année</p>
              <p className="text-xl font-bold text-gray-900">{vehicle.year || 2024}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 text-center shadow-sm border border-gray-200">
              <Gauge className="w-6 h-6 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-1">Kilométrage</p>
              <p className="text-xl font-bold text-gray-900">
                {vehicle.mileage === 0 || !vehicle.mileage ? '0 km' : `${vehicle.mileage} km`}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-5 text-center shadow-sm border border-green-100">
              <Fuel className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-1">Carburant</p>
              <p className="text-xl font-bold text-gray-900">{vehicle.fuel || "Essence"}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-5 text-center shadow-sm border border-yellow-100">
              <Settings className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-1">Transmission</p>
              <p className="text-xl font-bold text-gray-900">{vehicle.transmission || "Auto"}</p>
            </div>
          </div>

          {/* Prix */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
            <p className="text-gray-600 text-sm mb-2">Prix mensuel</p>
            <p className="text-4xl font-extrabold text-red-600 mb-4">
              {formatPrice(vehicle.price)}
            </p>
            <button
              onClick={() => addToCart(vehicle)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl hover:from-red-500 hover:to-red-600 transition font-bold text-lg shadow-lg hover:shadow-xl"
            >
              <ShoppingCart size={24} />
              <span>Ajouter au panier</span>
            </button>
          </div>

          {/* Caractéristiques principales */}
          <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-sm">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <span>✓</span> Caractéristiques principales
            </h3>
            <ul className="text-sm text-red-800 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                Garantie 12 mois
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                Service client 24/7
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                Livraison gratuite
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                Retour sans frais
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}