import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const UserTable = ({ users, onRoleChange, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="overflow-x-auto">
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img 
              src={selectedImage} 
              alt="User Full Size" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Téléphone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'inscription
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users?.map(user => {
            const userId = user._id || user.id;
            const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const userInitials = user.name ? user.name.substring(0, 2).toUpperCase() : `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
            
            return (
              <tr key={userId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 overflow-hidden bg-blue-600">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={userName} 
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedImage(user.profileImage)}
                        />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {userName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.phone || '-'}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(userId, e.target.value)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onDelete(userId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;