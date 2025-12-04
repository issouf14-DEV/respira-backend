import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { formatPrice } from "../../utils/helpers";

export default function VehicleTable({ vehicles, onEdit, onDelete, onView }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Modèle</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Marque</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Prix</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{vehicle.model}</td>
              <td className="px-6 py-4 text-sm">{vehicle.brand}</td>
              <td className="px-6 py-4 text-sm font-bold text-kia_red">
                {formatPrice(vehicle.price)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  vehicle.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {vehicle.stock}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onView(vehicle._id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(vehicle._id)}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(vehicle._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}