import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Afficher le message de succès après inscription
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Veuillez saisir votre email et mot de passe');
        setLoading(false);
        return;
      }

      console.log('📝 Tentative de connexion...');
      const result = await login(formData.email, formData.password);
      console.log('🔑 Résultat login:', result);
      
      if (result?.success) {
        console.log('✨ Login réussi!');
        
        // Déclencher un événement pour mettre à jour le panier
        try {
          window.dispatchEvent(new Event('user-changed'));
        } catch (eventError) {
          console.warn('Erreur event dispatch:', eventError);
        }
        
        // Forcer la redirection immédiate
        const redirectTimeout = setTimeout(() => {
          console.log('🚀 Redirection vers:', from);
          try {
            navigate(from, { replace: true });
          } catch (navError) {
            console.warn('Erreur navigation, fallback vers location:', navError);
            window.location.href = from;
          }
        }, 300);
        
        // Cleanup timeout si le composant est démonté
        return () => clearTimeout(redirectTimeout);
      } else {
        console.log('❌ Erreur login:', result?.message);
        setError(result?.message || 'Erreur de connexion inconnue');
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setError('Erreur inattendue, veuillez réessayer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b0b0b] via-[#471414] to-[#180707] flex items-center justify-center px-4 sm:px-8 pt-24">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white/95 backdrop-blur">
        <div className="relative hidden md:flex flex-col justify-between p-10 text-white bg-[url('https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=900&q=80&auto=format')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-red-800/80 to-black/70" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4" /> Sécurité optimale
            </span>
            <h2 className="mt-8 text-3xl font-extrabold leading-tight">Rejoignez la communauté GBA et accédez à vos véhicules premium en quelques clics.</h2>
            <p className="mt-4 text-sm text-white/80">
              Consultez vos commandes, sauvegardez vos modèles favoris et profitez d'un suivi personnalisé.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-sm text-white/80">
            <Heart className="h-5 w-5 text-red-200" /> Assistance 24/7 &nbsp;•&nbsp; Transactions sécurisées &nbsp;•&nbsp; Historique complet
          </div>
        </div>

        <div className="px-6 py-10 sm:px-10 bg-white">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900">Connexion à votre compte</h2>
            <p className="mt-2 text-sm text-gray-500">
              Nouveau chez nous ?{' '}
              <Link to="/register" className="font-semibold text-red-600 hover:text-red-500">
                Créez un compte en 1 minute
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse email</label>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <Mail className="h-5 w-5 text-red-400" />
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

              <div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="password" className="font-medium text-gray-700">Mot de passe</label>
                  <a href="#" className="font-semibold text-red-500 hover:text-red-600">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="mt-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200">
                  <Lock className="h-5 w-5 text-red-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
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

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 space-y-3 rounded-2xl bg-red-50/70 p-4 text-sm text-red-800">
            <p className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Connexion sécurisée</p>
            <p>Vos données sont chiffrées et protégées. Nous ne partageons jamais vos informations sans consentement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;