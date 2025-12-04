/**
 * Composants de chargement Skeleton pour améliorer l'UX
 */

/**
 * Skeleton de base
 */
export const Skeleton = ({ className = '', width, height }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton pour une carte de véhicule
 */
export const VehicleCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Image */}
      <Skeleton className="w-full h-64" />
      
      <div className="p-6">
        {/* Titre */}
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        {/* Description */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        
        {/* Prix et bouton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton pour la liste de véhicules
 */
export const VehiclesListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Skeleton pour une table
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-24" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton pour les statistiques (Dashboard)
 */
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
};

/**
 * Skeleton pour le Dashboard complet
 */
export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      
      {/* Table */}
      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <TableSkeleton />
      </div>
    </div>
  );
};

/**
 * Skeleton pour un formulaire
 */
export const FormSkeleton = ({ fields = 6 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-32 mt-6" />
    </div>
  );
};

/**
 * Skeleton pour les détails d'un véhicule
 */
export const VehicleDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <Skeleton className="w-full h-96 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-20" />
            ))}
          </div>
        </div>
        
        {/* Infos */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton pour la liste de commandes
 */
export const OrdersListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton pour le profil utilisateur
 */
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header avec avatar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
        
        {/* Infos */}
        <div className="p-8 space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
          
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
