import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { carImages } from "../../assets/carImages";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-kia_dark to-kia_red text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-slide-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              "La route se partage, pas ta story"
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Découvrez notre collection exclusive de véhicules premium. Qualité, luxe et performance garantis.
            </p>
            <Link
              to="/vehicles"
              className="inline-flex items-center space-x-2 bg-white text-kia_red px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              <span>Explorez nos modèles</span>
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="animate-fade-in hidden md:block">
            <img
              src={carImages.luxury1}
              alt="Hero Car"
              className="rounded-lg shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}