import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaShoppingCart, FaSearchPlus, FaTimes } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { carImages, getRandomCarImage } from '../assets/carImages';

// Hero Banner avec slider
const HeroSlider = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      background: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&q=80&auto=format',
      carImage: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&q=80&auto=format',
      badge: '🔥 Nouveautés 2025',
      title: 'Votre voyage commence ici',
      subtitle: 'Des véhicules d\'exception pour des moments inoubliables',
      description: 'Découvrez notre collection exclusive de véhicules premium. Performance, confort et technologie de pointe pour une expérience de conduite inégalée.',
      glowColor: 'bg-red-500/40'
    },
    {
      background: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&auto=format',
      carImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80&auto=format',
      badge: '⚡ 100% Électrique',
      title: 'L\'avenir est électrique',
      subtitle: 'Performances et écologie réunies',
      description: 'Autonomie exceptionnelle, recharge rapide et zéro émission. Vivez l\'expérience de la mobilité durable sans compromis.',
      glowColor: 'bg-green-500/40'
    },
    {
      background: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&q=80&auto=format',
      carImage: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=1200&q=80&auto=format',
      badge: '🌿 Hybride',
      title: 'Le meilleur des deux mondes',
      subtitle: 'Hybride rechargeable',
      description: 'Combinez puissance thermique et efficacité électrique. La technologie hybride pour une conduite intelligente et économique.',
      glowColor: 'bg-blue-500/40'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[600px] md:h-[750px] overflow-hidden rounded-b-3xl">
      {slides.map((slide, index) => (
        <article
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.background})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-slate-900/40" />

          <div className="relative h-full">
            <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 md:flex-row md:items-center md:gap-16 lg:px-10">
              <div className="max-w-xl text-white animate-fade-in">
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-5 py-2 text-sm font-bold text-white shadow-lg animate-pulse-slow mb-6">
                    {slide.badge}
                  </div>
                )}
                <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl mb-4 drop-shadow-2xl">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="text-2xl font-semibold text-red-400 mb-6">
                    {slide.subtitle}
                  </p>
                )}
                <p className="text-lg text-white/90 leading-relaxed mb-8">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/vehicles"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300"
                  >
                    <span>Découvrir nos véhicules</span>
                    <FaChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                  >
                    <FaPhone className="w-5 h-5" />
                    <span>Nous contacter</span>
                  </Link>
                </div>
              </div>

              <div className="relative w-full max-w-md animate-float">
                <div className={`absolute -inset-6 -z-10 blur-3xl ${slide.glowColor} animate-pulse-slow`} aria-hidden="true" />
                <div className="relative rounded-3xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-xl hover:scale-105 transition-transform duration-500 overflow-hidden">
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-2xl text-base font-black shadow-2xl z-10 border-2 border-white/30">
                    ⭐ PREMIUM
                  </div>
                  <img
                    src={slide.carImage}
                    alt="Véhicule premium"
                    className="mx-auto h-64 w-full object-contain drop-shadow-[0_30px_60px_rgba(255,0,0,0.3)] hover:scale-110 transition-transform duration-700 rounded-2xl"
                  />
                  <div className="mt-6 flex items-center justify-center gap-2 text-white/90 text-sm font-semibold">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <span>Véhicules disponibles immédiatement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}

      {/* Boutons de navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 shadow-lg transition hover:bg-white z-20"
      >
        <FaChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 shadow-lg transition hover:bg-white z-20"
      >
        <FaChevronRight className="h-6 w-6" />
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 w-10 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white shadow-lg scale-110' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Section Offres avec lightbox et bouton panier
const OffersSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const offers = [
    {
      id: 1,
      title: 'Peugeot 208',
      price: 13427500,
      monthlyPrice: '130 250 FCFA/mois',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      brand: 'Peugeot',
      model: '208',
      year: 2024,
      transmission: 'Manuelle',
      fuel: 'Essence',
      mileage: 0
    },
    {
      id: 2,
      title: 'ID.3 100% électrique',
      price: 25537950,
      monthlyPrice: '195 570 FCFA/mois',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      brand: 'Volkswagen',
      model: 'ID.3',
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0
    },
    {
      id: 3,
      title: 'T-Roc VW Edition',
      price: 29475000,
      monthlyPrice: '228 570 FCFA/mois',
      image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800',
      badge: 'Sans frais de dossier',
      brand: 'Volkswagen',
      model: 'T-Roc',
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0
    }
  ];

  const openLightbox = (image) => {
    setSelectedImage(image);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const handleAddToCart = (e, vehicle) => {
    e.stopPropagation();
    addToCart(vehicle);
    alert(`${vehicle.title} ajouté au panier !`);
  };

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Les offres du moment</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              En ce début d'année, profitez d'offres exceptionnelles sur l'ensemble de la gamme.{' '}
              <Link to="/vehicles" className="text-red-600 hover:underline font-semibold">
                Je profite des offres*
              </Link>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group border-2 border-gray-100 hover:border-red-500"
              >
                <div className="relative h-64 overflow-hidden cursor-pointer rounded-t-2xl" onClick={() => openLightbox(offer.image)}>
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-100"
                  />
                  {offer.badge && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {offer.badge}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <FaSearchPlus className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 drop-shadow-lg">{offer.title}</h3>
                  <p className="text-gray-800 mb-4 font-semibold drop-shadow"> 
                    à partir de <span className="text-2xl font-bold text-red-600">{offer.monthlyPrice}</span>*
                  </p>
                  <button
                    onClick={(e) => handleAddToCart(e, offer)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-600 hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50"
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10"
          >
            <FaTimes className="w-8 h-8 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Vue agrandie"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

// Section Modèles avec lightbox et panier
const ModelsSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [filter, setFilter] = useState('Tous');
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const filterOptions = [
    { label: 'Tous', value: 'all', link: '/vehicles' },
    { label: 'Thermiques (15)', value: 'thermal', link: '/vehicles?type=thermal' },
    { label: 'Hybrides (6)', value: 'hybrid', link: '/vehicles?type=hybrid' },
    { label: 'Électriques (5)', value: 'electric', link: '/vehicles?type=electric' }
  ];
  
  // Stabilisez les modèles avec useMemo
  const models = useMemo(() => [
    {
      id: 1,
      name: 'Renault Clio',
      title: 'Renault Clio V',
      startPrice: '12 107 500 FCFA',
      price: 12107500,
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
      type: 'Thermiques',
      brand: 'Renault',
      model: 'Clio V',
      year: 2024,
      transmission: 'Manuelle',
      fuel: 'Essence',
      mileage: 0
    },
    {
      id: 2,
      name: 'AMG GT',
      title: 'Mercedes AMG GT',
      startPrice: '88 425 000 FCFA',
      price: 88425000,
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800',
      type: 'Thermiques',
      brand: 'Mercedes',
      model: 'AMG GT',
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Essence',
      mileage: 0
    },
    {
      id: 3,
      name: 'Golf eHybrid',
      title: 'Volkswagen Golf eHybrid',
      startPrice: '30 704 500 FCFA',
      price: 30704500,
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
      type: 'Hybrides',
      brand: 'Volkswagen',
      model: 'Golf eHybrid',
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Hybride',
      mileage: 0
    },
    {
      id: 4,
      name: 'ID.3',
      title: 'Volkswagen ID.3',
      startPrice: '24 207 450 FCFA',
      price: 24207450,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
      type: 'Électriques',
      brand: 'Volkswagen',
      model: 'ID.3',
      year: 2024,
      transmission: 'Automatique',
      fuel: 'Électrique',
      mileage: 0
    }
  ], []);

  const normalizeString = (str) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filteredModels = useMemo(() => {
    if (filter === 'Tous') return models;
    
    const filterText = normalizeString(filter.split('(')[0].trim());
    
    return models.filter(model => {
      return normalizeString(model.type) === filterText;
    });
  }, [filter, models, normalizeString]);

  const openLightbox = (image) => {
    setSelectedImage(image);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const handleAddToCart = (e, vehicle) => {
    e.stopPropagation();
    addToCart(vehicle);
    alert(`${vehicle.name} ajouté au panier !`);
  };

  return (
    <>
      <section className="py-16 bg-white" key={`models-section-${filter}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Découvrir nos modèles</h2>

          {/* Filtres */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filterOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setFilter(option.label)}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                  filter === option.label 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="text-center text-gray-600 mb-8 font-medium">
            {filteredModels.length} modèle{filteredModels.length > 1 ? 's' : ''} disponible{filteredModels.length > 1 ? 's' : ''}
          </p>

          {filteredModels.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredModels.map((model) => (
                <div 
                  key={`model-${model.id}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between border-2 border-gray-100 hover:border-red-500"
                >
                  <div className="relative cursor-pointer" onClick={() => openLightbox(model.image || getRandomCarImage())}>
                    <div className="h-64 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden rounded-t-2xl">
                      <img 
                        src={model.image || getRandomCarImage()} 
                        alt={model.name} 
                        onError={e => {e.target.src = getRandomCarImage();}} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <FaSearchPlus className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-3">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 drop-shadow-lg">{model.name}</h3>
                    <p className="text-gray-800 text-sm mb-2 font-semibold drop-shadow">
                      À partir de <span className="font-bold text-lg text-gray-900">{model.startPrice}</span> TTC**
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, model)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 rounded-lg hover:from-red-700 hover:to-red-600 hover:scale-105 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-red-500/50"
                    >
                      <FaShoppingCart className="w-4 h-4" /> Ajouter au panier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun véhicule disponible dans cette catégorie</p>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Découvrez tous nos véhicules en visitant notre <Link to="/vehicles" className="text-red-600 hover:underline font-semibold">catalogue complet</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-10"
          >
            <FaTimes className="w-8 h-8 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Vue agrandie"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

// Composant principal Home
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />
      <OffersSection />
      <ModelsSection />
    </div>
  );
}
