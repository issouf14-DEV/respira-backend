import { CheckCircle, Truck, Shield, Headphones } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      icon: <Truck size={32} />,
      title: "Livraison rapide",
      description: "Livraison gratuite partout en Côte d'Ivoire",
    },
    {
      icon: <Shield size={32} />,
      title: "Garantie complète",
      description: "Tous nos véhicules sont garantis 12 mois",
    },
    {
      icon: <Headphones size={32} />,
      title: "Support 24/7",
      description: "Notre équipe est toujours disponible pour vous",
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Qualité certifiée",
      description: "Tous nos véhicules sont inspectés et certifiés",
    },
  ];

  return (
    <section className="py-20 bg-kia_light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-kia_dark mb-12">
          Nos services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition animate-slide-in"
            >
              <div className="text-kia_red mb-4 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-kia_dark mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}