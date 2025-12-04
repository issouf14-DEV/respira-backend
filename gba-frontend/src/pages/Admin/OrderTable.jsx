import { getStatusColor } from "../../utils/helpers";
import { formatDate } from "../../utils/formatDate";

export default function OrderTable({ orders, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Numéro</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Client</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Date</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Total</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-bold">{order._id.slice(0, 8)}</td>
              <td className="px-6 py-4 text-sm">{order.user?.name || "N/A"}</td>
              <td className="px-6 py-4 text-sm">{formatDate(order.createdAt)}</td>
              <td className="px-6 py-4 text-sm font-bold">{order.totalPrice}€</td>
              <td className="px-6 py-4 text-sm">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-bold border-0 cursor-pointer ${getStatusColor(order.status)}`}
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}