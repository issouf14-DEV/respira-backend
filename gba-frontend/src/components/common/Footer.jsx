import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaCar, FaShieldAlt, FaAward, FaWhatsapp, FaHeart, FaPlay } from 'react-icons/fa';
import { useState } from 'react';

const Footer = () => {
  const [hoveredVideo, setHoveredVideo] = useState(null);
  
  const videoData = [
    {
      id: 1,
      video: 'https://cdn.pixabay.com/vimeo/328940114/cars-82593.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&q=80&auto=format',
      title: 'Mercedes AMG GT',
      description: 'Performance et luxe'
    },
    {
      id: 2,
      video: 'https://cdn.pixabay.com/vimeo/333260303/audi-82940.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80&auto=format',
      title: 'Électrique Moderne',
      description: 'Technologie avancée'
    },
    {
      id: 3,
      video: 'https://cdn.pixabay.com/vimeo/313098161/car-79574.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format',
      title: 'Design Innovant',
      description: 'L\'avenir de la mobilité'
    }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Pattern de fond animé */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Effets lumineux */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>

      {/* Ligne rouge dégradée animée en haut */}
      <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Section Vidéos */}
        <div className="mb-16">
          <h2 className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent">
            Nos Véhicules en Action
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Découvrez nos plus beaux modèles en vidéo</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {videoData.map((video) => (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-xl aspect-video cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                {/* Vidéo ou Image */}
                {hoveredVideo === video.id ? (
                  <video
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  >
                    <source src={video.video} type="video/mp4" />
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  </video>
                ) : (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Play button - caché si vidéo joue */}
                {hoveredVideo !== video.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600/80 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-100 group-hover:scale-125 group-hover:bg-red-600 transition-all duration-300 shadow-2xl hover:shadow-red-600/50">
                      <FaPlay className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                )}
                
                {/* Texte */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
                  <p className="text-red-400 text-sm font-semibold">{video.description}</p>
                </div>
                
                {/* Ligne rouge */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent transform scaleX-0 group-hover:scaleX-100 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* À propos LE-GBA */}
          <div className="space-y-6">
            <div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent mb-4 animate-pulse">
                LE-GBA
              </h3>
              <p className="text-gray-300 leading-relaxed text-base">
                🚗 Votre partenaire automobile de confiance en Côte d'Ivoire. Qualité, fiabilité et excellence depuis des années.
              </p>
            </div>

            {/* Badges avec animations */}
            <div className="flex flex-wrap gap-3">
              <div className="group flex items-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
                <FaCar className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">200+ Véhicules</span>
              </div>
              <div className="group flex items-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
                <FaShieldAlt className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Garantie</span>
              </div>
              <div className="group flex items-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
                <FaAward className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Certifié</span>
              </div>
            </div>

            {/* Réseaux sociaux avec effets */}
            <div>
              <p className="text-gray-400 text-sm mb-3 font-medium">Suivez-nous</p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  <FaFacebookF className="text-gray-300 group-hover:text-white transition-colors text-lg" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                >
                  <FaInstagram className="text-gray-300 group-hover:text-white transition-colors text-lg" />
                </a>
                <a 
                  href="https://wa.me/2250503713115" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/50"
                >
                  <FaWhatsapp className="text-gray-300 group-hover:text-white transition-colors text-lg" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-400/50"
                >
                  <FaLinkedinIn className="text-gray-300 group-hover:text-white transition-colors text-lg" />
                </a>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-red-600 to-transparent"></span>
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Nos véhicules
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-red-600 to-transparent"></span>
              Nos Services
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Vente de véhicules neufs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Vente de véhicules d'occasion
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Financement automobile
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Garantie étendue
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Livraison à domicile
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-[2px] bg-red-600 transition-all duration-300"></span>
                  Service après-vente
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-red-600 to-transparent"></span>
              Contactez-nous
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="tel:+2250503713115" 
                  className="flex items-start gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300 flex-shrink-0">
                    <FaPhone className="text-red-500 group-hover:text-white group-hover:scale-110 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Téléphone</p>
                    <p className="font-bold text-base group-hover:text-red-400 transition-colors">05 03 71 31 15</p>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:fofanaissouf179@gmail.com" 
                  className="flex items-start gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300 flex-shrink-0">
                    <FaEnvelope className="text-red-500 group-hover:text-white group-hover:scale-110 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Email</p>
                    <p className="font-semibold text-sm break-all group-hover:text-red-400 transition-colors">fofanaissouf179@gmail.com</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Adresse</p>
                    <p className="font-semibold">Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Horaires</p>
                    <p className="font-semibold">Lun-Sam: 8h-18h</p>
                    <p className="text-sm text-gray-400">Dimanche: Fermé</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation avec dégradé */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>

        {/* Bottom - Copyright & Liens légaux */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-300 text-base mb-2 font-medium">
              &copy; 2025 <span className="text-red-500 font-bold">LE-GBA</span>. Tous droits réservés.
            </p>
            <p className="text-gray-500 text-sm font-medium">
              🏆 Concessionnaire automobile de confiance en Côte d'Ivoire
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/legal" className="text-gray-400 hover:text-red-400 transition-all duration-300 font-medium hover:underline">
              Mentions légales
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/privacy" className="text-gray-400 hover:text-red-400 transition-all duration-300 font-medium hover:underline">
              Confidentialité
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms" className="text-gray-400 hover:text-red-400 transition-all duration-300 font-medium hover:underline">
              CGV
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookies" className="text-gray-400 hover:text-red-400 transition-all duration-300 font-medium hover:underline">
              Cookies
            </Link>
          </div>
        </div>

        {/* Message inspirant avec effet de brillance */}
        <div className="mt-10 text-center relative">
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <p className="relative text-gray-200 text-lg font-semibold italic px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full border border-gray-700 group-hover:border-red-500 transition-all duration-300">
              "Votre satisfaction est notre priorité" <FaHeart className="inline-block text-red-500 animate-pulse ml-2" />
            </p>
          </div>
        </div>

        {/* Badge "Made with love" */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            Fait avec <FaHeart className="inline-block text-red-500 animate-pulse mx-1" /> en Côte d'Ivoire
          </p>
        </div>
      </div>

      {/* Ligne rouge dégradée animée en bas */}
      <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>
    </footer>
  );
};

export default Footer;