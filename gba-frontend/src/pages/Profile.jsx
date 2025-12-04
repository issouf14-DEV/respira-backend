import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash, FaSignOutAlt, FaShoppingBag, FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Extraire prénom et nom du champ 'name' si firstName/lastName ne sont pas disponibles
  const getFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0] || '';
    return '';
  };

  const getLastName = () => {
    if (user?.lastName) return user.lastName;
    if (user?.name) {
      const parts = user.name.split(' ');
      return parts.slice(1).join(' ') || '';
    }
    return '';
  };

  const getUserInitials = () => {
    const firstName = getFirstName();
    const lastName = getLastName();
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (user?.name) return user.name.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const [formData, setFormData] = useState({
    firstName: getFirstName(),
    lastName: getLastName(),
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showImageModal, setShowImageModal] = useState(false);

  // Initialiser les données du formulaire avec les données utilisateur
  useEffect(() => {
    if (user) {
      const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '') || '';
      const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '') || '';
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      
      if (user.profileImage) {
        setImagePreview(user.profileImage);
        setProfileImage(user.profileImage);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5 MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fonction pour sauvegarder la photo de profil
  const handleSaveImage = () => {
    if (imagePreview) {
      const updatedUser = {
        ...user,
        profileImage: imagePreview,
        firstName: formData.firstName || getFirstName(),
        lastName: formData.lastName || getLastName()
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      updateUser(updatedUser);
      setSuccess('Photo de profil enregistrée avec succès !');
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = { 
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      };
      if (imagePreview) {
        payload.profileImage = imagePreview;
      }
      
      // Essayer d'envoyer au backend
      try {
        const response = await axios.put('/api/users/profile', payload);
        const updatedUser = { ...user, ...response.data };
        if (payload.profileImage) {
          updatedUser.profileImage = payload.profileImage;
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
      } catch (apiError) {
        // Si le backend échoue, sauvegarder localement
        console.log('Backend non disponible, sauvegarde locale');
        const updatedUser = {
          ...user,
          ...payload,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
      }
      
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await axios.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Spacer pour éviter la navbar */}
      <div className="h-20"></div>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-red-500/50 overflow-hidden">
              {imagePreview || user?.profileImage ? (
                <img 
                  src={imagePreview || user?.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  {getUserInitials()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2">Mon Profil</h1>
              <p className="text-gray-400 text-lg">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (imagePreview || user?.profileImage) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img 
              src={imagePreview || user?.profileImage} 
              alt="Profile Full Size" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              onClick={() => setShowImageModal(false)}
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-8 shadow-lg flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              ✓
            </div>
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-lg flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              ✕
            </div>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <div className="text-center mb-8">
                <div className="relative w-28 h-28 mx-auto mb-4 group">
                  {imagePreview || user?.profileImage ? (
                    <img
                      src={imagePreview || user?.profileImage}
                      alt="Photo de profil"
                      className="w-full h-full rounded-full object-cover shadow-2xl border-4 border-white cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowImageModal(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-red-500/30 border-4 border-white">
                      {getUserInitials()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                    <FaEdit className="text-sm" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {(imagePreview || user?.profileImage) && (
                    <button
                      onClick={removeImage}
                      className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg border-2 border-white"
                      title="Supprimer la photo"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || `${getFirstName()} ${getLastName()}`.trim() || 'Utilisateur'}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                
                {/* Bouton Enregistrer la photo */}
                {imagePreview && imagePreview !== user?.profileImage && (
                  <button
                    onClick={handleSaveImage}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <FaSave />
                    Enregistrer la photo
                  </button>
                )}
              </div>

              <nav className="space-y-3">
                <a href="#info" className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  <FaUserCircle className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Informations</span>
                </a>
                <a href="#password" className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 rounded-xl text-gray-700 hover:text-red-600 transition-all duration-300">
                  <FaLock className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Mot de passe</span>
                </a>
                <a href="/profile/orders" className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 rounded-xl text-gray-700 hover:text-red-600 transition-all duration-300">
                  <FaShoppingBag className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Mes commandes</span>
                </a>
                <button
                  onClick={logout}
                  className="group w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 text-left text-gray-700"
                >
                  <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations personnelles */}
            <div id="info" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Informations personnelles</h2>
                  <p className="text-gray-500">Gérez vos informations de profil</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                  >
                    <FaEdit className="group-hover:rotate-12 transition-transform" />
                    Modifier
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Section Photo de profil - toujours visible */}
                {isEditing && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaUserCircle className="text-red-600" />
                      Modifier la photo de profil
                    </h3>
                    <div className="flex items-center gap-6">
                      <div 
                        className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
                        onClick={() => (imagePreview || user?.profileImage) && setShowImageModal(true)}
                      >
                        {imagePreview || user?.profileImage ? (
                          <img
                            src={imagePreview || user?.profileImage}
                            alt="Aperçu"
                            className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg border-4 border-white">
                            {getUserInitials()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-3">
                          JPG, PNG ou GIF. Taille max: 5 MB. Cliquez sur l'image pour la voir en grand.
                        </p>
                        <div className="flex gap-3">
                          <label className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all inline-flex items-center gap-2">
                            <FaEdit />
                            Choisir une photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          {(imagePreview || user?.profileImage) && (
                            <button
                              type="button"
                              onClick={removeImage}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all inline-flex items-center gap-2"
                            >
                              <FaTimes />
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaUser className="text-red-600" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Votre prénom"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-medium ${
                        isEditing 
                          ? 'border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <FaUser className="text-red-600" />
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Votre nom"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-medium ${
                        isEditing 
                          ? 'border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaEnvelope className="text-red-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="votre@email.com"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-medium ${
                      isEditing 
                        ? 'border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaPhone className="text-red-600" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="05 00 00 00 00"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-medium ${
                      isEditing 
                        ? 'border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaMapMarkerAlt className="text-red-600" />
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Votre adresse complète"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 font-medium ${
                      isEditing 
                        ? 'border-red-300 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: getFirstName(),
                          lastName: getLastName(),
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                      className="group flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                    >
                      <FaTimes className="group-hover:rotate-90 transition-transform" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSave className="group-hover:scale-110 transition-transform" />
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Changer le mot de passe */}
            <div id="password" className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Changer le mot de passe</h2>
                <p className="text-gray-500">Sécurisez votre compte avec un nouveau mot de passe</p>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaLock className="text-red-600" />
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaLock className="text-red-600" />
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      placeholder="Entrez un nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimum 6 caractères</p>
                </div>

                <div className="mb-8">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FaLock className="text-red-600" />
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 font-medium"
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaLock className="group-hover:scale-110 transition-transform" />
                  {loading ? 'Modification en cours...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;