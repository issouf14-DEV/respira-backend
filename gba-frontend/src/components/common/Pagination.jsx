import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Hook pour gérer la pagination
 */
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const resetPagination = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Composant de pagination réutilisable
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  maxPageButtons = 7
}) => {
  // Calculer les boutons de page à afficher
  const pageButtons = useMemo(() => {
    const buttons = [];
    const halfRange = Math.floor(maxPageButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);
    
    // Ajuster si on est au début ou à la fin
    if (currentPage <= halfRange) {
      endPage = Math.min(totalPages, maxPageButtons);
    }
    if (currentPage > totalPages - halfRange) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }
    
    // Ajouter le bouton "1" si nécessaire
    if (startPage > 1) {
      buttons.push(1);
      if (startPage > 2) {
        buttons.push('...');
      }
    }
    
    // Ajouter les boutons du milieu
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    
    // Ajouter le dernier bouton si nécessaire
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push('...');
      }
      buttons.push(totalPages);
    }
    
    return buttons;
  }, [currentPage, totalPages, maxPageButtons]);

  // Calculer les infos d'affichage
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Info */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold">{startItem}</span> à{' '}
          <span className="font-semibold">{endItem}</span> sur{' '}
          <span className="font-semibold">{totalItems}</span> résultats
        </div>
      )}

      {/* Boutons de pagination */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          <FaChevronLeft size={12} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Boutons de numéro de page */}
        <div className="flex items-center gap-1">
          {pageButtons.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  min-w-[40px] px-3 py-2 rounded-lg font-medium transition
                  ${page === currentPage
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
          `}
        >
          <span className="hidden sm:inline">Suivant</span>
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
