import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useFormValidation, ValidatedInput } from '../hooks/useFormValidation';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash, FaSignOutAlt, FaShoppingBag, FaUserCircle, FaCamera } from 'react-icons/fa';
import axios from 'axios';

const ProfileImproved = () => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Validation du profil
  const profileForm = useFormValidation(
    {
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    },
    {
      firstName: { required: 'Le prénom est requis', minLength: 2 },
      lastName: { required: 'Le nom est requis', minLength: 2 },
      email: { required: 'L\'email est requis', email: true },
      phone: { phone: true },
      address: {}
    }
  );

  // Validation du mot de passe
  const passwordForm = useFormValidation(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    {
      currentPassword: { required: 'Le mot de passe actuel est requis', minLength: 6 },
      newPassword: { 
        required: 'Le nouveau mot de passe est requis', 
        minLength: 6,
        custom: (value, values) => {
          if (value === values.currentPassword) {
            return 'Le nouveau mot de passe doit être différent de l\'ancien';
          }
        }
      },
      confirmPassword: { 
        required: 'Veuillez confirmer le mot de passe',
        custom: (value, values) => {
          if (value !== values.newPassword) {
            return 'Les mots de passe ne correspondent pas';
          }
        }
      }
    }
  );

  const handleProfileSubmit = profileForm.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      updateUser(response.data);
      toast.success('✅ Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  });

  const handlePasswordSubmit = passwordForm.handleSubmit(async (data) => {
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success('✅ Mot de passe modifié avec succès');
      setIsChangingPassword(false);
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      toast.success('À bientôt ! 👋');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header avec avatar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 text-white relative">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl border-4 border-white shadow-xl">
                  <FaUserCircle />
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition">
                  <FaCamera size={16} />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {user?.name || `${profileForm.values.firstName} ${profileForm.values.lastName}`}
                </h1>
                <p className="text-red-100 flex items-center gap-2">
                  <FaEnvelope size={14} />
                  {user?.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-yellow-300' : 'bg-green-300'}`}></span>
                  {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b">
            <button 
              onClick={() => {
                setIsEditing(false);
                setIsChangingPassword(false);
              }}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                !isEditing && !isChangingPassword
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              📋 Informations
            </button>
            <Link 
              to="/profile/orders"
              className="flex-1 px-6 py-4 font-semibold text-gray-600 hover:text-red-600 transition text-center"
            >
              🛒 Mes commandes
            </Link>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!isEditing && !isChangingPassword ? (
            <>
              {/* Affichage des informations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField icon={<FaUser />} label="Prénom" value={profileForm.values.firstName || 'Non renseigné'} />
                  <InfoField icon={<FaUser />} label="Nom" value={profileForm.values.lastName || 'Non renseigné'} />
                  <InfoField icon={<FaEnvelope />} label="Email" value={profileForm.values.email} />
                  <InfoField icon={<FaPhone />} label="Téléphone" value={profileForm.values.phone || 'Non renseigné'} />
                </div>
                <InfoField icon={<FaMapMarkerAlt />} label="Adresse" value={profileForm.values.address || 'Non renseignée'} fullWidth />
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <FaEdit /> Modifier le profil
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  <FaLock /> Changer le mot de passe
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold ml-auto"
                >
                  <FaSignOutAlt /> Déconnexion
                </button>
              </div>
            </>
          ) : isEditing ? (
            <>
              {/* Formulaire d'édition du profil */}
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaEdit /> Modifier le profil
              </h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Prénom"
                    name="firstName"
                    value={profileForm.values.firstName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.errors.firstName}
                    touched={profileForm.touched.firstName}
                    required
                  />
                  <ValidatedInput
                    label="Nom"
                    name="lastName"
                    value={profileForm.values.lastName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.errors.lastName}
                    touched={profileForm.touched.lastName}
                    required
                  />
                  <ValidatedInput
                    label="Email"
                    name="email"
                    type="email"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.errors.email}
                    touched={profileForm.touched.email}
                    required
                  />
                  <ValidatedInput
                    label="Téléphone"
                    name="phone"
                    type="tel"
                    value={profileForm.values.phone}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.errors.phone}
                    touched={profileForm.touched.phone}
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                <ValidatedInput
                  label="Adresse"
                  name="address"
                  value={profileForm.values.address}
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                  error={profileForm.errors.address}
                  touched={profileForm.touched.address}
                  placeholder="Abidjan, Cocody..."
                />

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading || profileForm.isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                  >
                    <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      profileForm.reset();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <FaTimes /> Annuler
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Formulaire de changement de mot de passe */}
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaLock /> Changer le mot de passe
              </h2>
              <form onSubmit={handlePasswordSubmit}>
                <PasswordInput
                  label="Mot de passe actuel"
                  name="currentPassword"
                  value={passwordForm.values.currentPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  error={passwordForm.errors.currentPassword}
                  touched={passwordForm.touched.currentPassword}
                  showPassword={showPasswords.current}
                  onToggle={() => togglePasswordVisibility('current')}
                  required
                />
                <PasswordInput
                  label="Nouveau mot de passe"
                  name="newPassword"
                  value={passwordForm.values.newPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  error={passwordForm.errors.newPassword}
                  touched={passwordForm.touched.newPassword}
                  showPassword={showPasswords.new}
                  onToggle={() => togglePasswordVisibility('new')}
                  required
                />
                <PasswordInput
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  value={passwordForm.values.confirmPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  error={passwordForm.errors.confirmPassword}
                  touched={passwordForm.touched.confirmPassword}
                  showPassword={showPasswords.confirm}
                  onToggle={() => togglePasswordVisibility('confirm')}
                  required
                />

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading || passwordForm.isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                  >
                    <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      passwordForm.reset();
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <FaTimes /> Annuler
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher une information
const InfoField = ({ icon, label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
      {icon} {label}
    </label>
    <p className="text-lg text-gray-900 font-medium">{value}</p>
  </div>
);

// Composant pour le champ de mot de passe
const PasswordInput = ({ label, name, value, onChange, onBlur, error, touched, showPassword, onToggle, required }) => {
  const showError = touched && error;
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            showError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default ProfileImproved;
