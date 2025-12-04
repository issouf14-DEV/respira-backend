import React from 'react';
import { FaCar, FaShieldAlt, FaTools, FaClock, FaCreditCard, FaUserCheck } from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: FaCar,
      title: 'Vente de Véhicules',
      description: 'Large sélection de véhicules premium neufs et d\'occasion soigneusement inspectés.'
    },
    {
      icon: FaShieldAlt,
      title: 'Garantie Étendue',
      description: 'Protection complète pour votre véhicule avec des options de garantie flexibles.'
    },
    {
      icon: FaTools,
      title: 'Service Après-Vente',
      description: 'Entretien professionnel et réparations par des techniciens qualifiés.'
    },
    {
      icon: FaCreditCard,
      title: 'Solutions de Financement',
      description: 'Options de financement personnalisées pour répondre à vos besoins.'
    },
    {
      icon: FaClock,
      title: 'Assistance 24/7',
      description: 'Support technique et assistance routière disponibles 24h/24 et 7j/7.'
    },
    {
      icon: FaUserCheck,
      title: 'Conseil Personnalisé',
      description: 'Accompagnement expert pour trouver le véhicule parfait selon vos critères.'
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
              Ce que nous offrons
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Nos <span className="text-red-500">Services</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Des solutions complètes et personnalisées pour tous vos besoins automobiles
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Services Complets</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
            Une gamme complète de services pour vous accompagner à chaque étape
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200 hover:scale-105"
              >
                <div className="p-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-red-500/50">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-red-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {service.description}
                  </p>
                </div>
                <div className="h-2 bg-gradient-to-r from-red-600 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTQ2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Prêt à Démarrer ?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Contactez-nous dès aujourd'hui pour discuter de vos besoins et découvrir comment nous pouvons vous accompagner dans votre projet automobile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-105"
              >
                <span>Nous Contacter</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/vehicles"
                className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur text-white border-2 border-white/20 px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all transform hover:scale-105"
              >
                Voir nos véhicules
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pourquoi Nous Choisir */}
      <div className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Pourquoi Choisir <span className="text-red-600">LE-GBA</span> ?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Expertise Reconnue</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Notre équipe possède une expertise approfondie et reconnue dans le secteur automobile premium.
            </p>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">💎</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Service Premium</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Un service client exceptionnel et personnalisé, disponible pour chacun de nos clients.
            </p>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Solutions Complètes</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Une gamme complète de services intégrés pour répondre à tous vos besoins automobiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;