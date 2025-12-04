import { useState } from 'react';

/**
 * Composant d'image optimisée - Version simplifiée sans lazy loading
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '',
  placeholderSrc,
  onLoad,
  onError,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setError(true);
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
      )}

      {/* Image d'erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <span className="text-4xl mb-2">🖼️</span>
            <p className="text-sm">Image indisponible</p>
          </div>
        </div>
      )}

      {/* Image réelle - chargement immédiat */}
      <img
        src={src || placeholderSrc || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover ${className}`}
        {...props}
      />
    </div>
  );
};

/**
 * Hook pour le lazy loading
 */
export const useLazyLoad = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
};

/**
 * Composant de galerie d'images optimisée
 */
export const ImageGallery = ({ images, alt = 'Gallery image' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Image principale */}
        <div 
          className="relative aspect-video cursor-pointer rounded-xl overflow-hidden"
          onClick={() => openModal(selectedIndex)}
        >
          <OptimizedImage
            src={images[selectedIndex]}
            alt={`${alt} ${selectedIndex + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                  index === selectedIndex ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition z-10"
          >
            ✕
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white text-5xl hover:text-gray-300 transition"
          >
            ‹
          </button>

          <img
            src={images[selectedIndex]}
            alt={`${alt} ${selectedIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 text-white text-5xl hover:text-gray-300 transition"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Utilitaire pour optimiser une URL d'image
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;

  // Si c'est une URL Cloudinary, ajouter les transformations
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${quality}`);
      transformations.push(`f_${format}`);
      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }

  return url;
};

export default OptimizedImage;
