import { FaTrash, FaEdit } from "react-icons/fa";

export default function UserTable({ users, onDelete, onRoleChange }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Email</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Rôle</th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{user.name}</td>
              <td className="px-6 py-4 text-sm">{user.email}</td>
              <td className="px-6 py-4 text-sm">
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user._id, e.target.value)}
                  className="px-2 py-1 rounded text-xs font-bold border border-gray-300"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex space-x-3">
                  <button className="text-yellow-500 hover:text-yellow-700">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(user._id)}
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