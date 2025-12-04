import React from 'react';
import { Building2, Users, Trophy, Target } from 'lucide-react';

const About = () => {
  const stats = [
    { value: '10+', label: 'Années d\'expérience', icon: Building2 },
    { value: '1000+', label: 'Clients satisfaits', icon: Users },
    { value: '150+', label: 'Véhicules vendus', icon: Trophy },
    { value: '98%', label: 'Taux de satisfaction', icon: Target }
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
              Notre entreprise
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            À Propos de <span className="text-red-500">LE-GBA</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Votre partenaire de confiance pour l'acquisition de véhicules premium en Côte d'Ivoire
          </p>
        </div>
      </div>

      {/* Notre Histoire */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Notre Histoire</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Depuis notre création, <span className="font-bold text-red-600">LE-GBA</span> s'est imposé comme un <span className="font-semibold">leader dans le secteur automobile en Côte d'Ivoire</span>. Notre engagement envers l'excellence et la satisfaction client nous a permis de construire une réputation solide dans le domaine des véhicules premium.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Notre mission est de fournir à nos clients une <span className="font-semibold">expérience d'achat automobile exceptionnelle</span>, en proposant une sélection rigoureuse de véhicules de qualité et un service client irréprochable.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                <img 
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80&auto=format" 
                  alt="LE-GBA Showroom - Véhicules Premium"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white text-xl font-bold mb-2">Excellence & Innovation</p>
                  <p className="text-gray-200 text-sm">Votre partenaire automobile de confiance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl text-center group hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-5xl font-black text-white mb-3 group-hover:text-red-400 transition-colors">{stat.value}</h3>
                    <p className="text-gray-300 font-semibold text-sm uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nos Valeurs */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Nos Valeurs</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Excellence</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Nous nous engageons à maintenir les plus hauts standards de qualité dans tous nos services.
            </p>
          </div>
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Intégrité</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              La transparence et l'honnêteté sont au cœur de toutes nos interactions avec nos clients.
            </p>
          </div>
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-t-4 border-red-600">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">Innovation</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Nous adoptons les dernières technologies pour améliorer continuellement notre service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;