import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import NotificationBell from './NotificationBell';
import useOrderNotifications from '../../hooks/useOrderNotifications';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaChevronDown, FaPhone, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hook pour les notifications
  useOrderNotifications(isAdmin ? 'admin' : 'client');
  
  // États
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModelsMenu, setShowModelsMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs pour gérer les clics en dehors
  const userMenuRef = useRef(null);
  const modelsMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Gestion du scroll pour effet sticky
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setShowModelsMenu(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (modelsMenuRef.current && !modelsMenuRef.current.contains(event.target)) {
        setShowModelsMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Désactiver le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/vehicles?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  // Vérifier si le lien est actif
  const isActive = (path) => location.pathname === path;

  // Catégories de modèles pour le dropdown
  const modelCategories = [
    { name: 'Tous les modèles', path: '/vehicles' },
    { name: 'Électriques', path: '/vehicles?type=electric' },
    { name: 'Hybrides', path: '/vehicles?type=hybrid' },
    { name: 'Thermiques', path: '/vehicles?type=thermal' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg' : ''
    }`}>
      {/* Top bar avec réseaux sociaux */}
      <div className="bg-gradient-to-r from-[#2b0b0b] via-[#401010] to-[#5a1111] py-2.5 border-b border-amber-900/40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 hover:bg-amber-900 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 hover:bg-amber-900 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 hover:bg-amber-900 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>

            {/* Contact */}
            <a 
              href="tel:+2250503713115" 
              className="flex items-center gap-2 text-white text-sm hover:text-amber-300 transition-colors"
            >
                <FaPhone className="w-4 h-4 hidden sm:block" />
              <span className="hidden md:block">05 03 71 31 15</span>
              <span className="md:hidden">📞</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className={`bg-white/90 backdrop-blur-sm transition-all duration-300 ${
        scrolled ? 'shadow-lg shadow-amber-900/10 border-b border-amber-100/60' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-3xl font-bold text-gray-900 transition-transform group-hover:scale-105">
                <span className="text-amber-900 drop-shadow-sm">LE-GBA</span>
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-amber-900 font-semibold uppercase text-sm transition-colors relative group ${
                  isActive('/') ? 'text-amber-900' : ''
                }`}
              >
                Accueil
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-900 transition-transform origin-left ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>

              {/* Dropdown Modèles */}
              <div className="relative" ref={modelsMenuRef}>
                <button
                  onClick={() => setShowModelsMenu(!showModelsMenu)}
                  className={`flex items-center gap-1 text-gray-700 hover:text-amber-900 font-semibold uppercase text-sm transition-colors relative group ${
                    location.pathname.includes('/vehicles') ? 'text-amber-900' : ''
                  }`}
                >
                  Modèles
                  <FaChevronDown className={`w-4 h-4 transition-transform ${showModelsMenu ? 'rotate-180' : ''}`} />
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-900 transition-transform origin-left ${
                    location.pathname.includes('/vehicles') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {showModelsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-amber-100 animate-fade-in">
                    {modelCategories.map((category) => (
                      <Link
                        key={category.path}
                        to={category.path}
                        className="block px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        onClick={() => setShowModelsMenu(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/about" 
                className={`text-gray-700 hover:text-amber-900 font-semibold uppercase text-sm transition-colors relative group ${
                  isActive('/about') ? 'text-amber-900' : ''
                }`}
              >
                À propos
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-900 transition-transform origin-left ${
                  isActive('/about') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>

              <Link 
                to="/services" 
                className={`text-gray-700 hover:text-amber-900 font-semibold uppercase text-sm transition-colors relative group ${
                  isActive('/services') ? 'text-amber-900' : ''
                }`}
              >
                Services
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-900 transition-transform origin-left ${
                  isActive('/services') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>

              <Link 
                to="/contact" 
                className={`text-gray-700 hover:text-amber-900 font-semibold uppercase text-sm transition-colors relative group ${
                  isActive('/contact') ? 'text-amber-900' : ''
                }`}
              >
                Contact
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-amber-900 transition-transform origin-left ${
                  isActive('/contact') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                {searchOpen ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white rounded-full px-4 py-2 animate-fade-in border border-amber-200/70 shadow-lg min-w-[250px] z-50">
                    <FaSearch className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                      placeholder="Rechercher un véhicule..."
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-900 placeholder-gray-400"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-amber-900 flex-shrink-0"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSearchOpen(true)}
                    className="p-2 hover:bg-amber-50 rounded-full transition-colors group"
                    aria-label="Rechercher"
                  >
                    <FaSearch className="w-5 h-5 text-gray-700 group-hover:text-amber-900 transition-colors" />
                  </button>
                )}
              </div>

              {/* Notifications */}
              {isAuthenticated && <NotificationBell />}

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 hover:bg-amber-50 rounded-full transition-colors group"
                aria-label="Panier"
              >
                <FaShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-amber-900 transition-colors" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 hover:bg-amber-50 rounded-full transition-colors"
                    aria-label="Menu utilisateur"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.firstName?.[0]?.toUpperCase() || '') + (user?.lastName?.[0]?.toUpperCase() || '') || user?.email?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-amber-100 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="w-4 h-4" />
                        Mon profil
                      </Link>
                      
                      <Link
                        to="/profile/orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        Mes commandes
                      </Link>
                      
                      <Link
                        to="/order-history"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Historique
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-amber-900 hover:bg-amber-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-lg hover:from-amber-800 hover:to-amber-900 transition-all font-semibold shadow-md hover:shadow-xl"
                >
                  <FaUser className="w-4 h-4" />
                  Connexion
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {showMobileMenu ? (
                  <FaTimes className="w-6 h-6 text-gray-700" />
                ) : (
                  <FaBars className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden fixed inset-0 top-[116px] bg-white z-40 overflow-y-auto animate-slide-down">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-1">
                  <Link 
                    to="/" 
                    className={`px-4 py-3 rounded-lg font-semibold uppercase transition-colors ${
                      isActive('/') ? 'bg-amber-50 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    Accueil
                  </Link>
                  
                  <Link 
                    to="/vehicles" 
                    className={`px-4 py-3 rounded-lg font-semibold uppercase transition-colors ${
                      isActive('/vehicles') ? 'bg-amber-50 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    Modèles
                  </Link>
                  
                  <Link 
                    to="/about" 
                    className={`px-4 py-3 rounded-lg font-semibold uppercase transition-colors ${
                      isActive('/about') ? 'bg-amber-50 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    À propos
                  </Link>
                  
                  <Link 
                    to="/services" 
                    className={`px-4 py-3 rounded-lg font-semibold uppercase transition-colors ${
                      isActive('/services') ? 'bg-amber-50 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    Services
                  </Link>
                  
                  <Link 
                    to="/contact" 
                    className={`px-4 py-3 rounded-lg font-semibold uppercase transition-colors ${
                      isActive('/contact') ? 'bg-amber-50 text-amber-900' : 'text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    Contact
                  </Link>

                  {!isAuthenticated && (
                    <>
                      <hr className="my-4" />
                      <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-lg hover:from-amber-800 hover:to-amber-900 transition-colors font-semibold"
                      >
                        <FaUser className="w-5 h-5" />
                        Connexion
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
  `}</style>
    </header>
  );
};

export default Header;