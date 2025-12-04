import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, CheckCircle2, Car } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sendWelcomeEmail } from '../services/emailService';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    // Transformer les données pour correspondre au schéma backend
    const userData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone || '',
      address: formData.address || '',
      profileImage: imagePreview, // Image en base64
      firstName: formData.firstName,
      lastName: formData.lastName
    };
    
    const result = await register(userData);
    
    if (result.success) {
      // Envoyer l'email de bienvenue automatiquement
      sendWelcomeEmail({
        email: userData.email,
        name: userData.name
      }).then(emailResult => {
        if (emailResult.success) {
          console.log('✅ Email de bienvenue envoyé à', userData.email);
        }
      }).catch(() => {
        // Silencieux - ne pas bloquer l'inscription
      });
      
      // Rediriger vers la page de connexion après l'inscription
      navigate('/login', { 
        state: { 
          message: 'Bienvenue chez GBA ! Connectez-vous pour réserver. ☎️ 0503713115',
          email: formData.email 
        } 
      });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b0b0b] via-[#471414] to-[#180707] flex items-center justify-center py-16 px-4 sm:px-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_1fr] rounded-3xl overflow-hidden shadow-2xl bg-white/95 backdrop-blur">
        <div className="relative hidden lg:flex flex-col justify-between p-10 text-white bg-[url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1100&q=80&auto=format')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-red-800/80 to-black/70" />
          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              <Car className="h-4 w-4" /> Profil Premium
            </span>
            <h2 className="text-3xl font-black leading-tight">Inscrivez-vous et bénéficiez d’un accompagnement sur mesure pour trouver votre prochaine voiture.</h2>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-green-300" /> Historique de vos recherches et véhicules favoris toujours accessibles.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-green-300" /> Offres exclusives et conseils personnalisés en priorité.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-green-300" /> Suivi de vos commandes en temps réel, du devis à la livraison.</li>
            </ul>
          </div>
          <div className="relative z-10 text-sm text-white/70">
            Service client disponible 7j/7 • Données chiffrées • Confiance des plus grandes marques
          </div>
        </div>

        <div className="bg-white px-6 py-10 sm:px-10">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900">Créer votre compte</h2>
            <p className="mt-2 text-sm text-gray-500">
              Vous avez déjà un accès ?{' '}
              <Link to="/login" className="font-semibold text-red-600 hover:text-red-500">
                Connectez-vous ici
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-red-400" /> Prénom *
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-red-400" /> Nom *
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Photo de profil upload */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-red-400" /> Photo de profil (optionnel)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-red-400" /> Email *
              </label>
              <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemple@domaine.com"
                  className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-400" /> Téléphone
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(+225) 00 00 00 00"
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400" /> Adresse
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Votre ville, quartier..."
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400" /> Mot de passe *
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 caractères"
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400" /> Confirmer *
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    className="w-full border-0 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-red-50/80 p-4 text-xs text-red-900">
              <span className="font-semibold">Bon à savoir :</span>
              <span>- Utilisez un mot de passe unique avec des lettres, chiffres et symboles.</span>
              <span>- Vos données personnelles restent confidentielles et ne sont jamais revendues.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Inscription en cours...
                </>
              ) : (
                "S'inscrire maintenant"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;