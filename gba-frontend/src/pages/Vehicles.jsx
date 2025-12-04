import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { vehiclesAPI } from '../api/vehicles';
import Loader from '../components/common/Loading';
import { carImages, getRandomCarImage } from '../assets/carImages';

export default function Vehicles() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [searchParams] = useSearchParams();

  const normalizeText = (value) =>
    value
      ? value
          .toString()
          .normalize('NFD')
          .replace(/[^\w\s]/g, '')
          .toLowerCase()
          .trim()
      : '';

  const resolveVehicleType = (vehicle) => {
    // Si le type est explicitement défini, l'utiliser directement
    if (vehicle?.type && ['thermal', 'electric', 'hybrid'].includes(vehicle.type)) {
      return vehicle.type;
    }

    // Sinon, essayer de déduire du champ fuel ou autres
    const explicitType = [
      vehicle?.type,
      vehicle?.category,
      vehicle?.vehicleType,
      vehicle?.fuelType,
      vehicle?.fuel,
      vehicle?.energy,
      vehicle?.engineType
    ].find(Boolean);

    if (!explicitType) return 'thermal';

    const normalized = normalizeText(explicitType);

    if (normalized.includes('elect')) return 'electric';
    if (normalized.includes('hybr')) return 'hybrid';
    if (
      normalized.includes('therm') ||
      normalized.includes('essence') ||
      normalized.includes('diesel') ||
      normalized.includes('gazo')
    ) {
      return 'thermal';
    }
    
    return 'thermal';
  };

  const resolveVehicleFuel = (vehicle) => {
    // Si fuel est déjà défini, l'utiliser
    if (vehicle?.fuel && vehicle.fuel !== 'undefined') {
      return vehicle.fuel;
    }

    // Sinon, déduire du type
    const type = vehicle?.type || vehicle?._resolvedType || resolveVehicleType(vehicle);
    
    switch (type) {
      case 'electric':
        return 'Électrique';
      case 'hybrid':
        return 'Hybride';
      case 'thermal':
      default:
        return 'Essence';
    }
  };

  const resolveVehicleTransmission = (vehicle) => {
    if (vehicle?.transmission) return vehicle.transmission;
    // Valeur par défaut basée sur le type/prix
    const price = vehicle?.price || 0;
    return price > 20000000 ? 'Automatique' : 'Manuelle';
  };

  const resolveVehiclePower = (vehicle) => {
    if (vehicle?.power) return vehicle.power;
    // Estimer la puissance basée sur le type et le prix
    const type = vehicle?.type || resolveVehicleType(vehicle);
    const price = vehicle?.price || 0;
    
    if (type === 'electric') {
      return price > 50000000 ? '400+ ch' : '200-300 ch';
    }
    if (type === 'hybrid') {
      return '150-250 ch';
    }
    // thermal
    return price > 50000000 ? '300+ ch' : '120-200 ch';
  };

  const withResolvedType = (list) =>
    (Array.isArray(list) ? list : []).map((vehicle) => {
      const resolvedType = resolveVehicleType(vehicle);
      return {
        ...vehicle,
        _resolvedType: resolvedType,
        type: vehicle?.type || resolvedType,
        fuel: resolveVehicleFuel({...vehicle, type: resolvedType}),
        transmission: resolveVehicleTransmission(vehicle),
        power: resolveVehiclePower(vehicle),
        year: vehicle?.year || 2024,
        mileage: vehicle?.mileage || 0,
        brand: vehicle?.brand || vehicle?.name?.split(' ')[0] || 'Marque',
        model: vehicle?.model || vehicle?.name || 'Modèle',
        available: vehicle?.available !== undefined ? vehicle.available : true
      };
    });

  const pickVehicleValue = (vehicle, paths = [], fallback = 'Non précisé') => {
    for (const path of paths) {
      let value = null;
      if (typeof path === 'function') {
        value = path(vehicle);
      } else if (typeof path === 'string') {
        value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), vehicle);
      }

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return fallback;
  };

  const getDemoVehicles = () => [
    {
      id: 1,
      name: 'Volkswagen Golf GTI',
      brand: 'Volkswagen',
      model: 'Golf GTI',
      type: 'thermal',
      price: 22925000,
      image: 'https://images.unsplash.com/photo-1622353219448-46a8f44ce528?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '245 ch'
    },
    {
      id: 2,
      name: 'Volkswagen ID.3',
      brand: 'Volkswagen',
      model: 'ID.3',
      type: 'electric',
      price: 25537950,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      available: false,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0,
      power: '204 ch'
    },
    {
      id: 3,
      name: 'Audi RS6 Avant',
      brand: 'Audi',
      model: 'RS6 Avant',
      type: 'thermal',
      price: 81875000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      available: false,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '600 ch'
    },
    {
      id: 4,
      name: 'Porsche 911 Carrera',
      brand: 'Porsche',
      model: '911 Carrera',
      type: 'thermal',
      price: 81875000,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      available: false,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '385 ch'
    },
    {
      id: 5,
      name: 'Volkswagen Polo',
      brand: 'Volkswagen',
      model: 'Polo',
      type: 'thermal',
      price: 14376250,
      image: 'https://images.unsplash.com/photo-1583267746897-bee1827ab02c?w=800',
      available: true,
      year: 2024,
      transmission: 'Manuelle',
      fuel: 'Essence',
      mileage: 0,
      power: '95 ch'
    },
    {
      id: 6,
      name: 'Volkswagen Golf eHybrid',
      brand: 'Volkswagen',
      model: 'Golf eHybrid',
      type: 'hybrid',
      price: 30704500,
      image: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Hybride',
      mileage: 0,
      power: '204 ch'
    },
    {
      id: 7,
      name: 'Audi e-tron GT',
      brand: 'Audi',
      model: 'e-tron GT',
      type: 'electric',
      price: 68775000,
      image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0,
      power: '476 ch'
    },
    {
      id: 8,
      name: 'Mercedes-AMG GT',
      brand: 'Mercedes',
      model: 'AMG GT',
      type: 'thermal',
      price: 88425000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
      available: false,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '585 ch'
    },
    {
      id: 9,
      name: 'BMW iX',
      brand: 'BMW',
      model: 'iX',
      type: 'electric',
      price: 55675000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0,
      power: '326 ch'
    },
    {
      id: 10,
      name: 'Volkswagen Arteon R',
      brand: 'Volkswagen',
      model: 'Arteon R',
      type: 'thermal',
      price: 42575000,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      available: true,
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0,
      power: '320 ch'
    }
  ];

  // Forcer le rechargement des véhicules simulés au démarrage
  useEffect(() => {
    const mockKey = 'mock_vehicles';
    const currentData = localStorage.getItem(mockKey);
    if (!currentData || JSON.parse(currentData).length < 10) {
      console.log('🔄 Réinitialisation des véhicules simulés...');
      localStorage.removeItem(mockKey);
    }
  }, []);

  const [vehicles, setVehicles] = useState(() => withResolvedType(getDemoVehicles()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(() => searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    brands: [],
    year: '',
    sortBy: 'recent'
  });
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des véhicules...');
      
      const response = await vehiclesAPI.getAll();
      console.log('📦 Réponse reçue:', response);
      
      const rawData = response?.data ?? response ?? [];

      let parsedVehicles = [];
      if (Array.isArray(rawData)) {
        parsedVehicles = rawData;
      } else if (Array.isArray(rawData?.vehicles)) {
        parsedVehicles = rawData.vehicles;
      }

      // Vérifier si les véhicules du backend ont des types valides
      const hasValidTypes = parsedVehicles.some(v => 
        v.type && ['thermal', 'electric', 'hybrid'].includes(v.type)
      );

      // Si pas de véhicules OU si les véhicules n'ont pas de types valides, utiliser les données locales
      if (!parsedVehicles.length || !hasValidTypes) {
        console.warn('⚠️ Véhicules du backend sans types valides, utilisation des données locales');
        setVehicles(withResolvedType(getDemoVehicles()));
        return;
      }

      console.log('✅ Véhicules backend chargés:', parsedVehicles.length);
      setVehicles(withResolvedType(parsedVehicles));
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Impossible de charger les véhicules');
      // En cas d'erreur, utiliser les véhicules de démonstration
      console.log('📊 Utilisation des véhicules locaux');
      setVehicles(withResolvedType(getDemoVehicles()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger d'abord les véhicules locaux
    console.log('📦 Chargement initial des véhicules locaux...');
    const localVehicles = getDemoVehicles();
    setVehicles(withResolvedType(localVehicles));
    
    // Ensuite essayer de charger depuis l'API (qui utilisera le fallback si nécessaire)
    fetchVehicles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Écouter les événements de mise à jour de véhicules
    const handleVehicleUpdate = () => {
      console.log('🔄 Événement de mise à jour reçu, rechargement...');
      fetchVehicles();
    };
    
    window.addEventListener('vehicleUpdated', handleVehicleUpdate);
    window.addEventListener('vehicleCreated', handleVehicleUpdate);
    window.addEventListener('vehicleDeleted', handleVehicleUpdate);
    
    return () => {
      window.removeEventListener('vehicleUpdated', handleVehicleUpdate);
      window.removeEventListener('vehicleCreated', handleVehicleUpdate);
      window.removeEventListener('vehicleDeleted', handleVehicleUpdate);
    };
  }, []);

  useEffect(() => {
    if ((vehicles || []).length) {
      const preview = (vehicles || []).slice(0, 5).map((v) => ({
        id: v.id || v._id,
        name: (v.model || v.name || 'N/A').substring(0, 25),
        brand: v.brand || 'N/A',
        type: v.type || 'N/A',
        fuel: v.fuel || 'N/A',
        transmission: v.transmission || 'N/A',
        power: v.power || 'N/A',
        price: `${Math.round((v.price || 0) / 1000000)}M FCFA`
      }));
      console.log('🚗 Véhicules chargés avec succès:');
      console.table(preview);
      console.log(`📊 Total: ${vehicles.length} véhicules`);
    }
  }, [vehicles]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && typeParam !== selectedType) {
      setSelectedType(typeParam);
      setSearchQuery('');
      setFilters({
        priceMin: '',
        priceMax: '',
        brands: [],
        year: '',
        sortBy: 'recent'
      });
    } else if (!typeParam && selectedType !== 'all') {
      setSelectedType('all');
    }
  }, [searchParams]);

  const vehiclesArray = withResolvedType(Array.isArray(vehicles) ? vehicles : []);

  // Debug: afficher les types détectés
  useEffect(() => {
    if (vehiclesArray.length > 0) {
      console.log('📊 Répartition des véhicules:');
      vehiclesArray.forEach(v => {
        console.log(`  - ${v.brand} ${v.model}: type="${v.type}", _resolvedType="${v._resolvedType}", fuel="${v.fuel}"`);
      });
    }
  }, [vehiclesArray.length]);

  const vehicleTypes = [
    { id: 'all', label: 'Tous', count: vehiclesArray.length },
    { id: 'thermal', label: 'Thermiques', count: vehiclesArray.filter(v => v._resolvedType === 'thermal').length },
    { id: 'hybrid', label: 'Hybrides', count: vehiclesArray.filter(v => v._resolvedType === 'hybrid').length },
    { id: 'electric', label: 'Électriques', count: vehiclesArray.filter(v => v._resolvedType === 'electric').length }
  ];

  const filteredVehicles = vehiclesArray.filter(vehicle => {
    const vehicleType = vehicle._resolvedType || resolveVehicleType(vehicle);
    if (selectedType !== 'all' && vehicleType !== selectedType) return false;

    const normalizedSearch = normalizeText(searchQuery);
    if (normalizedSearch) {
      const haystack = [
        vehicle?.name,
        vehicle?.brand,
        vehicle?.model,
        vehicle?.title,
        vehicle?.description
      ]
        .filter(Boolean)
        .map(normalizeText)
        .join(' ');
      if (!haystack.includes(normalizedSearch)) return false;
    }

    const priceMin = filters.priceMin ? parseInt(filters.priceMin, 10) : null;
    const priceMax = filters.priceMax ? parseInt(filters.priceMax, 10) : null;
    const vehiclePrice = Number(vehicle?.price ?? 0);

    if (priceMin !== null && vehiclePrice < priceMin) return false;
    if (priceMax !== null && vehiclePrice > priceMax) return false;
    return true;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return b.id - a.id;
    }
  });

  if (loading && vehiclesArray.length === 0) return <Loader />;

  if (error && vehicles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Impossible de charger les véhicules
          </h2>
          <p className="text-gray-600 mb-8">Veuillez réessayer.</p>
          <button
            onClick={fetchVehicles}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition font-semibold shadow"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
  <div className="bg-gradient-to-br from-[#2b0b0b] via-[#3b0f10] to-[#210909] text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">Nos Véhicules</h1>
          <p className="text-xl text-gray-300 text-center">Trouvez le véhicule parfait pour vous</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {vehicleTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white scale-105 shadow-red-500/30'
                  : 'bg-white text-gray-700 hover:bg-red-50'
              }`}
            >
              {type.label} ( {type.count} )
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un véhicule..."
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition font-semibold shadow-md"
            >
              <SlidersHorizontal className="w-5 h-5 inline mr-2" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="mt-8 pt-8 border-t-2">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold mb-4">Prix (FCFA)</h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Année</h3>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl"
                  >
                    <option value="">Toutes</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
                <div>
                  <h3 className="font-bold mb-4">Trier par</h3>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 rounded-xl"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-8 bg-white rounded-xl shadow-lg p-6">
          <p className="text-lg">
            <span className="font-bold text-2xl text-red-600">{sortedVehicles.length}</span> 
            <span className="text-gray-600"> sur </span>
            <span className="font-bold text-2xl text-gray-900">{vehiclesArray.length}</span> 
            <span className="text-gray-600"> véhicule{vehiclesArray.length > 1 ? 's' : ''}</span>
          </p>
          <button
            onClick={fetchVehicles}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
          </button>
        </div>

        {sortedVehicles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
            {sortedVehicles.map(vehicle => {
              const vehicleYear = pickVehicleValue(vehicle, ['year', 'modelYear', 'specs.year', 'details.year'], 'Non précisé');
              const vehicleTransmission = pickVehicleValue(
                vehicle,
                ['transmission', 'transmissionType', 'gearbox', 'specs.transmission', 'details.transmission'],
                'Non précisée'
              );
              const vehiclePower = pickVehicleValue(
                vehicle,
                ['power', 'horsePower', 'engine.power', 'specs.power', 'details.power'],
                'Non précisée'
              );

              return (
              <div
                key={vehicle.id || vehicle._id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between border-2 border-gray-100 hover:border-red-500"
              >
                <div className="relative cursor-pointer" onClick={() => { setSelectedImage(vehicle.image || getRandomCarImage()); setShowLightbox(true); document.body.style.overflow = 'hidden'; }}>
                  <div className="h-64 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
                    <img 
                      src={vehicle.image || getRandomCarImage()} 
                      alt={vehicle.name} 
                      onError={e => {e.target.src = getRandomCarImage();}} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <p className="text-sm font-semibold text-red-600 mb-1 uppercase">{vehicle.brand}</p>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-lg">{vehicle.model || vehicle.name}</h3>
                  <div className="space-y-2 mb-2 text-sm">
                    <div className="flex justify-between">
                      <span>Année:</span>
                      <span className="font-bold">{vehicleYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transmission:</span>
                      <span className="font-bold">{vehicleTransmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Puissance:</span>
                      <span className="font-bold">{vehiclePower}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t-2">
                    <p className="text-xs text-gray-500 mb-1 uppercase">Prix</p>
                    <p className="text-3xl font-bold text-red-600">
                      {vehicle.price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <div className="flex w-full mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(vehicle); alert(`${vehicle.model || vehicle.name} ajouté au panier !`); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-600 hover:scale-105 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/50"
                    >
                      <Plus className="w-5 h-5" /> Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
        {/* Lightbox */}
        {showLightbox && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => { setShowLightbox(false); setSelectedImage(null); document.body.style.overflow = 'unset'; }}
          >
            <button
              onClick={() => { setShowLightbox(false); setSelectedImage(null); document.body.style.overflow = 'unset'; }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10"
            >
              <X className="w-8 h-8 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Vue agrandie"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Aucun véhicule trouvé</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {selectedType !== 'all' ? 
                `Aucun véhicule ${selectedType === 'thermal' ? 'thermique' : selectedType === 'electric' ? 'électrique' : 'hybride'} ne correspond à vos critères.` :
                'Aucun véhicule ne correspond à vos critères de recherche.'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setFilters({ priceMin: '', priceMax: '', year: '', sortBy: 'recent' });
                }}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition font-semibold shadow-lg"
              >
                Réinitialiser les filtres
              </button>
              <button
                onClick={fetchVehicles}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold shadow-lg flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}