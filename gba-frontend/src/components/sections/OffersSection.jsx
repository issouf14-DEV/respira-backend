import VehicleCard from "../common/VehicleCard";
import { useVehicles } from "../../hooks/useVehicles";
import { useEffect } from "react";
import Loader from "../common/Loading";

export default function OffersSection() {
  const { vehicles, loading, fetchVehicles } = useVehicles();

  useEffect(() => {
    fetchVehicles(1, { isNew: true });
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader /></div>;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-kia_dark mb-3">Les offres du moment</h2>
          <p className="text-gray-600">Découvrez nos meilleures offres et opportunités</p>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 6).map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune offre disponible pour le moment</p>
          </div>
        )}
      </div>
    </section>
  );
}