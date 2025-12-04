import { useState, useEffect } from "react";
import { vehiclesAPI } from "../../api/vehicles";
import VehicleTable from "../../components/admin/VehicleTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { FaPlus } from "react-icons/fa";

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    price: "",
    year: "",
    image: "",
    description: "",
    // Nouveaux champs
    type: "thermal", // thermal, electric, hybrid
    fuel: "", // Essence, Diesel, Électrique, Hybride
    transmission: "", // Manuelle, Automatique
    power: "", // Puissance en chevaux
    engineSize: "", // Cylindrée
    doors: "5", // Nombre de portes
    seats: "5", // Nombre de places
    color: "", // Couleur
    mileage: "0", // Kilométrage
    available: true, // Disponibilité
    featured: false, // Véhicule en vedette
    tags: "", // Tags séparés par virgule
  });

  // Mettre à jour la disponibilité des véhicules en fonction des réservations
  const updateVehicleAvailability = (resetFirst = false) => {
    // Vérifier les deux clés possibles (mock_vehicles et vehicles)
    const vehiclesKey = localStorage.getItem('mock_vehicles') ? 'mock_vehicles' : 'vehicles';
    let storedVehicles = JSON.parse(localStorage.getItem(vehiclesKey) || '[]');
    
    // Si demandé, réinitialiser d'abord tous les véhicules à disponible
    if (resetFirst) {
      console.log('🔄 Réinitialisation: tous les véhicules à disponible...');
      storedVehicles = storedVehicles.map(v => ({...v, available: true}));
      console.log(`✅ ${storedVehicles.length} véhicules réinitialisés à disponible`);
    }
    
    // Récupérer TOUTES les commandes (pendingOrders ET mock_orders)
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const mockOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const allOrders = [...pendingOrders, ...mockOrders];
    
    console.log(`📦 Clé utilisée: ${vehiclesKey}`);
    console.log(`🚗 Véhicules trouvés: ${storedVehicles.length}`);
    console.log('📊 Commandes trouvées:', allOrders.length, '(pendingOrders:', pendingOrders.length, ', mockOrders:', mockOrders.length, ')');
    
    // Récupérer les IDs des véhicules réservés (commandes validées UNIQUEMENT)
    const reservedVehicleIds = new Set();
    allOrders.forEach(order => {
      // Ne considérer que les commandes validées (pas en attente ni rejetées)
      if (order.status === 'validee' || order.status === 'validated' || order.status === 'confirmed') {
        // Extraire l'ID du véhicule de la commande
        const vehicleId = order.vehicleId || order.vehicle?._id || order.vehicle?.id;
        if (vehicleId) {
          console.log('🔒 Véhicule réservé:', vehicleId, '- Statut:', order.status);
          reservedVehicleIds.add(vehicleId.toString());
        }
      } else {
        console.log('⏳ Commande ignorée:', order.vehicleId || 'ID inconnu', '- Statut:', order.status);
      }
    });
    
    console.log('🔒 IDs des véhicules réservés (validés uniquement):', Array.from(reservedVehicleIds));
    
    // Mettre à jour la disponibilité
    const updatedVehicles = storedVehicles.map(vehicle => {
      const vehicleId = (vehicle._id || vehicle.id).toString();
      const isAvailable = !reservedVehicleIds.has(vehicleId);
      
      if (!isAvailable) {
        console.log(`🔴 ${vehicle.brand} ${vehicle.model} (${vehicleId}) -> Indisponible (commande validée)`);
      } else {
        console.log(`✅ ${vehicle.brand} ${vehicle.model} (${vehicleId}) -> Disponible`);
      }
      
      return {
        ...vehicle,
        available: isAvailable
      };
    });
    
    localStorage.setItem(vehiclesKey, JSON.stringify(updatedVehicles));
    console.log('✅ Disponibilité des véhicules mise à jour selon les réservations');
    console.log(`📈 Résultat: ${updatedVehicles.filter(v => v.available).length}/${updatedVehicles.length} disponibles`);
    
    // Retourner pour que le state soit mis à jour
    return updatedVehicles;
  };

  useEffect(() => {
    // Au chargement initial: réinitialiser puis calculer selon les commandes validées
    console.log('🚀 Chargement initial: calcul de la disponibilité...');
    const updated = updateVehicleAvailability(true); // true = réinitialiser d'abord à disponible
    if (Array.isArray(updated) && updated.length) {
      setVehicles(updated);
      setFilteredVehicles(updated);
    }
    fetchVehicles();
    
    // Écouter les changements de statut de commandes
    const handleOrderStatusChange = () => {
      console.log('🔔 Événement reçu: statut de commande changé');
      const updated = updateVehicleAvailability(true); // Recalculer avec réinitialisation
      if (Array.isArray(updated) && updated.length) {
        setVehicles(updated);
        setFilteredVehicles(updated);
      }
      fetchVehicles();
    };
    
    window.addEventListener('orderStatusChanged', handleOrderStatusChange);
    window.addEventListener('orderStatusUpdated', handleOrderStatusChange);
    
    return () => {
      window.removeEventListener('orderStatusChanged', handleOrderStatusChange);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusChange);
    };
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des véhicules...');
      const data = await vehiclesAPI.getAll();
      console.log('✅ Véhicules reçus:', data);
      // Les véhicules peuvent être dans data directement ou dans data.vehicles
      const vehiclesList = Array.isArray(data) ? data : (data.vehicles || []);
      // Assurer que chaque véhicule a une propriété available par défaut (true)
      const normalized = vehiclesList.map(v => ({
        ...v,
        available: typeof v.available === 'boolean' ? v.available : true,
      }));
      // Appliquer une passe de recalcul sur la liste chargée
      const recalculated = updateVehicleAvailability(false);
      const finalList = Array.isArray(recalculated) && recalculated.length ? recalculated : normalized;
      const availableCount = finalList.filter(v => v.available).length;
      console.log(`📊 Disponibles: ${availableCount}/${finalList.length}`);
      setVehicles(finalList);
      setFilteredVehicles(finalList);
    } catch (error) {
      console.error("❌ Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour filtrer les véhicules selon la recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      return (
        vehicle.brand?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower) ||
        vehicle.fuel?.toLowerCase().includes(searchLower) ||
        vehicle.type?.toLowerCase().includes(searchLower) ||
        vehicle.color?.toLowerCase().includes(searchLower) ||
        vehicle.year?.toString().includes(searchLower) ||
        vehicle.price?.toString().includes(searchLower)
      );
    });

    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // Gestion de l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5 MB');
        return;
      }
      
      setImageFile(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload d'image vers un service (simulé ici)
  const uploadImage = async (file) => {
    try {
      setUploadProgress(0);
      
      // Simulation d'upload - À remplacer par votre service (Cloudinary, AWS S3, etc.)
      const formData = new FormData();
      formData.append('image', file);
      
      // Simulation de progression
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      // Pour l'instant, on utilise une URL de données locale
      // En production, vous devriez uploader vers votre backend/CDN
      return imagePreview;
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw new Error('Échec de l\'upload de l\'image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.brand || !formData.model || !formData.price || !formData.year) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      console.log('📝 Données du formulaire:', formData);
      
      // Upload de l'image si un fichier est sélectionné
      let imageUrl = formData.image;
      if (imageFile) {
        console.log('📤 Upload de l\'image...');
        imageUrl = await uploadImage(imageFile);
        console.log('✅ Image uploadée:', imageUrl);
      }
      
    // Préparer les données
    const vehicleData = {
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      price: Number(formData.price),
      year: Number(formData.year),
      image: imageUrl,
      description: formData.description.trim(),
      type: formData.type,
      fuel: formData.fuel.trim(),
      transmission: formData.transmission.trim(),
      power: formData.power.trim(),
      engineSize: formData.engineSize.trim(),
      doors: Number(formData.doors),
      seats: Number(formData.seats),
      color: formData.color.trim(),
      mileage: Number(formData.mileage),
      available: formData.available,
      featured: formData.featured,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };      console.log('🚗 Données à envoyer:', vehicleData);
      
      let result;
      if (editingId) {
        console.log('🔄 Mise à jour du véhicule:', editingId);
        result = await vehiclesAPI.updateVehicle(editingId, vehicleData);
        console.log('✅ Véhicule mis à jour:', result);
      } else {
        console.log('+ Ajout d un nouveau véhicule');
        result = await vehiclesAPI.createVehicle(vehicleData);
        console.log('✅ Véhicule créé:', result);
      }
      
    // Recharger les véhicules et fermer le modal
    await fetchVehicles();
    
    // Notifier les autres composants de la mise à jour
    window.dispatchEvent(new CustomEvent(editingId ? 'vehicleUpdated' : 'vehicleCreated', { 
      detail: { vehicle: result } 
    }));
    
    setShowModal(false);
    setFormData({
      brand: "",
      model: "",
      price: "",
      year: "",
      image: "",
      description: "",
      type: "thermal",
      fuel: "",
      transmission: "",
      power: "",
      engineSize: "",
      doors: "5",
      seats: "5",
      color: "",
      mileage: "0",
      available: true,
      featured: false,
      tags: "",
    });
    setImageFile(null);
    setImagePreview("");
    setUploadProgress(0);
    setEditingId(null);
    alert(editingId ? 'Véhicule mis à jour avec succès!' : 'Véhicule ajouté avec succès!');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      console.error('Détails:', error.response?.data);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      try {
        console.log('🗑️ Suppression du véhicule:', id);
        await vehiclesAPI.deleteVehicle(id);
        console.log('✅ Véhicule supprimé');
        await fetchVehicles();
        
        // Notifier les autres composants de la suppression
        window.dispatchEvent(new CustomEvent('vehicleDeleted', { 
          detail: { vehicleId: id } 
        }));
        
        alert('Véhicule supprimé avec succès!');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        console.error('Détails:', error.response?.data);
        alert(`Erreur de suppression: ${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
      }
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Gestion des véhicules</h1>
            {/* Total véhicules */}
            <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-lg" title="Total véhicules">
              {loading ? '...' : (searchTerm ? filteredVehicles.length : vehicles.length)}
            </span>
            {/* Compteur disponibles */}
            {!loading && vehicles.length > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold" title="Véhicules disponibles">
                {vehicles.filter(v => v.available).length} disponibles
              </span>
            )}
          </div>
          <p className="text-gray-600">Gérez votre flotte de véhicules</p>
        </div>
        <div className="flex gap-3">
          {/* Barre de recherche */}
          <div className="relative flex items-center bg-white border border-gray-300 rounded-xl shadow-sm px-4 py-2 min-w-[300px]">
            <svg 
              className="w-5 h-5 text-gray-400 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
            {searchTerm && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredVehicles.length} résultat{filteredVehicles.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              console.log('🔄 Actualisation selon commandes...');
              const updated = updateVehicleAvailability(true); // Réinitialiser puis recalculer
              if (Array.isArray(updated) && updated.length) {
                setVehicles(updated);
                setFilteredVehicles(updated);
              }
              fetchVehicles();
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            title="Recalculer la disponibilité selon les réservations validées uniquement"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualiser disponibilité</span>
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                brand: "",
                model: "",
                price: "",
                year: "",
                image: "",
                description: "",
                type: "thermal",
                fuel: "",
                transmission: "",
                power: "",
                engineSize: "",
                doors: "5",
                seats: "5",
                color: "",
                mileage: "0",
                available: true,
                featured: false,
                tags: "",
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus size={20} />
            <span>Ajouter un véhicule</span>
          </button>
        </div>
      </div>

        {loading ? (
          <div>Chargement...</div>
        ) : (
          <VehicleTable
            vehicles={filteredVehicles}
            onDelete={handleDelete}
            onEdit={(id) => {
              console.log('🔍 Recherche du véhicule avec ID:', id);
              const vehicle = vehicles.find((v) => (v._id || v.id) === id);
              if (vehicle) {
                console.log('✅ Véhicule trouvé:', vehicle);
                setFormData({
                  brand: vehicle.brand || '',
                  model: vehicle.model || '',
                  price: vehicle.price || '',
                  year: vehicle.year || '',
                  image: vehicle.image || '',
                  description: vehicle.description || '',
                  type: vehicle.type || 'thermal',
                  fuel: vehicle.fuel || '',
                  transmission: vehicle.transmission || '',
                  power: vehicle.power || '',
                  engineSize: vehicle.engineSize || '',
                  doors: vehicle.doors || '5',
                  seats: vehicle.seats || '5',
                  color: vehicle.color || '',
                  mileage: vehicle.mileage || '0',
                  available: vehicle.available !== undefined ? vehicle.available : true,
                  featured: vehicle.featured || false,
                  tags: Array.isArray(vehicle.tags) ? vehicle.tags.join(', ') : '',
                });
                setEditingId(id);
                setShowModal(true);
              } else {
                console.error('❌ Véhicule non trouvé');
                alert('Véhicule non trouvé');
              }
            }}
            onView={(id) => console.log("View", id)}
          />
        )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
              🚗
            </div>
            <span>{editingId ? "Modifier le véhicule" : "Ajouter un nouveau véhicule"}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Aide contextuelle */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="font-semibold text-red-800 mb-1">Guide rapide</p>
                  <p className="text-sm text-red-700">
                    <strong>Champs obligatoires :</strong> Marque, Modèle, Prix et Année<br/>
                    <strong>Conseil :</strong> Ajoutez une image et une description pour attirer les clients
                  </p>
                </div>
              </div>
            </div>
            
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque *
                </label>
                <input
                  type="text"
                  placeholder="Ex: BMW, Audi, Toyota..."
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Serie 3, A4, Corolla..."
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Prix et année */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  placeholder="25000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Année *
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2025"
                  placeholder="2023"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Type et carburant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de véhicule *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="thermal">Thermique</option>
                  <option value="electric">Électrique</option>
                  <option value="hybrid">Hybride</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carburant
                </label>
                <select
                  value={formData.fuel}
                  onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Électrique">Électrique</option>
                  <option value="Hybride">Hybride</option>
                  <option value="GPL">GPL</option>
                </select>
              </div>
            </div>

            {/* Transmission et puissance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Manuelle">Manuelle</option>
                  <option value="Automatique">Automatique</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puissance
                </label>
                <input
                  type="text"
                  placeholder="Ex: 150 ch, 2.0L, etc."
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Caractéristiques physiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portes
                </label>
                <select
                  value={formData.doors}
                  onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="2">2 portes</option>
                  <option value="3">3 portes</option>
                  <option value="4">4 portes</option>
                  <option value="5">5 portes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Places
                </label>
                <select
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="2">2 places</option>
                  <option value="4">4 places</option>
                  <option value="5">5 places</option>
                  <option value="7">7 places</option>
                  <option value="8">8 places</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <input
                  type="text"
                  placeholder="Ex: Noir, Blanc, Rouge..."
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilométrage
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du véhicule
              </label>
              
              {/* Preview de l'image */}
              {(imagePreview || formData.image) && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview || formData.image}
                    alt="Prévisualisation"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    ❌
                  </button>
                </div>
              )}
              
              {/* Barre de progression */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">{uploadProgress}% uploadé</p>
                </div>
              )}
              
              {/* Options d'upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span className="sr-only">Choisir une image</span>
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors cursor-pointer bg-gray-50 hover:bg-red-50">
                      <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium">📁 Depuis mon PC</span>
                        <span className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (max 5MB)</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ou via URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description détaillée du véhicule..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (séparés par virgule)
              </label>
              <input
                type="text"
                placeholder="sportive, luxe, familiale, économique"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Véhicule disponible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Véhicule en vedette</span>
              </label>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {editingId ? "✅ Mettre à jour" : "➕ Ajouter"} le véhicule
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-300"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </Modal>
    </div>
  );
}