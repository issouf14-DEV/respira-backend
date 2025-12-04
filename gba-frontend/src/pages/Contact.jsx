import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Créer le contenu de l'email
      const emailSubject = `📩 Message GBA - ${formData.subject}`;
      const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 NOUVEAU MESSAGE - FORMULAIRE CONTACT GBA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 INFORMATIONS CLIENT
• Nom: ${formData.name}
• Email: ${formData.email}
• Téléphone: ${formData.phone || 'Non renseigné'}

📋 SUJET
${formData.subject}

💬 MESSAGE
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${new Date().toLocaleString('fr-FR')}
🌐 Envoyé depuis le site GBA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      // Ouvrir Gmail directement avec l'email pré-rempli
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=fofanaissouf179@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Ouvrir dans un nouvel onglet
      window.open(gmailUrl, '_blank');
      
      setSuccess('Gmail s\'est ouvert avec votre message. Cliquez sur "Envoyer" pour finaliser !');
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Contactez-nous directement au 05 03 71 31 15.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      content: '05 03 71 31 15',
      link: 'tel:+2250503713115'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'fofanaissouf179@gmail.com',
      link: 'mailto:fofanaissouf179@gmail.com'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: 'Abidjan, Côte d\'Ivoire',
      link: 'https://goo.gl/maps/votre-adresse'
    },
    {
      icon: Clock,
      title: 'Heures d\'ouverture',
      content: 'Lun - Sam: 8h - 18h',
      description: 'Fermé le dimanche'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#2b0b0b] via-[#471414] to-[#180707] text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTQ2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-6 py-2 bg-red-600/20 backdrop-blur border border-red-400/30 rounded-full text-sm font-semibold uppercase tracking-wider">
              Restons en contact
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Contactez<span className="text-red-500">-nous</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-3">Envoyez-nous un message</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
            </div>

            {success && (
              <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom complet"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+225 XX XX XX XX XX"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Objet de votre message"
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Décrivez votre demande en détail..."
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-red-500/50 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-3">Nos Coordonnées</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
              <p className="text-gray-600 mt-4 text-lg">
                N'hésitez pas à nous contacter par téléphone, email ou en visitant notre showroom.
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-red-200 hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 mb-2">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            target={info.link.startsWith('http') ? '_blank' : undefined}
                            rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-gray-700 hover:text-red-600 transition-colors font-semibold text-lg"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-gray-700 font-semibold text-lg">{info.content}</p>
                        )}
                        {info.description && (
                          <p className="text-gray-500 text-sm mt-1">{info.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map */}
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
              <iframe
                title="Location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.4379659750466!2d-3.9962653!3d5.3483568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjAnMzQuMCJOIDPCsDU5JzQ2LjYiVw!5e0!3m2!1sfr!2sci!4v1635180762111!5m2!1sfr!2sci"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;