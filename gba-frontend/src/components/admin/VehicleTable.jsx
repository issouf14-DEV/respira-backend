import { useState } from 'react';
import Modal from '../../components/common/Modal';

const VehicleTable = ({ vehicles, onEdit, onDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const openPreview = (url) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  const placeholder = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80&auto=format&fit=crop';

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Véhicule
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Carburant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles?.map(vehicle => (
            <tr key={vehicle._id || vehicle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => openPreview(vehicle.image || placeholder)}
                  className="focus:outline-none"
                  title="Voir l'image en grand"
                >
                  <img
                    src={vehicle.image || placeholder}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-16 h-16 object-cover rounded hover:opacity-90 transition"
                  />
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{vehicle.brand}</div>
                <div className="text-sm text-gray-500">{vehicle.model}</div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                {vehicle.price?.toLocaleString()}€
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {vehicle.type || vehicle.year}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {vehicle.fuel || 'Non spécifié'}
              </td>
              <td className="px-6 py-4">
                {vehicle.available ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Disponible
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Indisponible
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm space-x-3">
                <button
                  onClick={() => onEdit(vehicle._id || vehicle.id)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(vehicle._id || vehicle.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showPreview && (
        <Modal onClose={closePreview} title={`${vehicles.find(v => (v._id || v.id) === (vehicles._id || vehicles.id)) ? 'Image du véhicule' : 'Aperçu de l\'image'}`}>
          <div className="flex items-center justify-center p-2">
            <img
              src={previewUrl || placeholder}
              alt="Aperçu du véhicule"
              className="max-h-[70vh] w-auto rounded-lg shadow-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VehicleTable;