import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import UserTable from "../../components/admin/UserTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { FaPlus } from "react-icons/fa";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des utilisateurs...');
      const response = await adminAPI.getUsers(1, 50);
      console.log('✅ Utilisateurs reçus:', response.data);
      const userData = response.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        console.log('🗑️ Suppression de l\'utilisateur:', id);
        await adminAPI.deleteUser(id);
        console.log('✅ Utilisateur supprimé');
        await fetchUsers();
        alert('Utilisateur supprimé avec succès!');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert(`Erreur de suppression: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
      }
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      console.log('🔄 Changement de rôle:', { id, role });
      await adminAPI.updateUserRole(id, role);
      console.log('✅ Rôle mis à jour');
      await fetchUsers();
      alert('Rôle mis à jour avec succès!');
    } catch (error) {
      console.error('❌ Erreur lors du changement de rôle:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.name || !formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      console.log('📝 Données du formulaire:', formData);
      
      // Préparer les données
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim(),
      };
      
      console.log('👤 Données utilisateur à envoyer:', userData);
      
      console.log('➕ Ajout d\'un nouvel utilisateur');
      const result = await adminAPI.createUser(userData);
      console.log('✅ Utilisateur créé:', result);
      
      // Recharger les utilisateurs et fermer le modal
      await fetchUsers();
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
        phone: "",
      });
      
      alert('Utilisateur ajouté avec succès!');
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('Détails:', error.response?.data);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Erreur</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button 
            onClick={fetchUsers}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-lg">
              {filteredUsers.length}
            </span>
          </div>
          <p className="text-gray-600">Gérez les comptes utilisateurs et administrateurs</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
              role: "client",
              phone: "",
            });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FaPlus size={20} />
          <span>Ajouter un utilisateur</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Rechercher un utilisateur (nom, email, téléphone...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 pl-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredUsers.length} résultat(s) trouvé(s) pour "{searchTerm}"
          </p>
        )}
      </div>

      <UserTable users={filteredUsers} onDelete={handleDelete} onRoleChange={handleRoleChange} />

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
              👤
            </div>
            <span>Ajouter un nouvel utilisateur</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Aide contextuelle */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-blue-800 mb-1">Guide rapide</p>
                <p className="text-sm text-blue-700">
                  <strong>Champs obligatoires :</strong> Nom, Email et Mot de passe (min. 6 caractères)<br/>
                  <strong>Rôles :</strong> Client (accès standard) ou Admin (accès complet)
                </p>
              </div>
            </div>
          </div>
          
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                placeholder="Ex: Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="jean.dupont@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe * (min. 6 caractères)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                minLength="6"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Rôle et téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="client">Client</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="Ex: +33 1 23 45 67 89"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              ➕ Créer l'utilisateur
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-300"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}