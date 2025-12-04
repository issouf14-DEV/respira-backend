// Données simulées pour le mode développement sans backend

// Véhicules simulés
export const mockVehicles = [
  {
    _id: '1',
    brand: 'BMW',
    model: 'X5',
    price: 75000,
    year: 2023,
    image: '/cars/bmw-x5.jpg',
    description: 'SUV de luxe spacieux et puissant',
    type: 'thermal',
    fuel: 'Essence',
    transmission: 'Automatique',
    power: '340 ch',
    engineSize: '3.0L',
    doors: 5,
    seats: 5,
    color: 'Noir',
    mileage: 15000,
    available: true,
    featured: true,
    tags: ['luxe', 'suv', 'familiale']
  },
  {
    _id: '2',
    brand: 'Mercedes-Benz',
    model: 'Classe E',
    price: 65000,
    year: 2023,
    image: '/cars/mercedes-e.jpg',
    description: 'Berline élégante et confortable',
    type: 'thermal',
    fuel: 'Diesel',
    transmission: 'Automatique',
    power: '220 ch',
    engineSize: '2.0L',
    doors: 4,
    seats: 5,
    color: 'Argent',
    mileage: 12000,
    available: true,
    featured: true,
    tags: ['luxe', 'berline', 'business']
  },
  {
    _id: '3',
    brand: 'Audi',
    model: 'A4',
    price: 55000,
    year: 2022,
    image: '/cars/audi-a4.jpg',
    description: 'Berline sportive et technologique',
    type: 'thermal',
    fuel: 'Essence',
    transmission: 'Automatique',
    power: '190 ch',
    engineSize: '2.0L',
    doors: 4,
    seats: 5,
    color: 'Bleu',
    mileage: 18000,
    available: true,
    featured: false,
    tags: ['sportive', 'berline', 'technologie']
  },
  {
    _id: '4',
    brand: 'Tesla',
    model: 'Model 3',
    price: 45000,
    year: 2024,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    description: 'Berline électrique performante',
    type: 'electric',
    fuel: 'Électrique',
    transmission: 'Automatique',
    power: '283 ch',
    engineSize: 'Électrique',
    doors: 4,
    seats: 5,
    color: 'Blanc',
    mileage: 5000,
    available: true,
    featured: true,
    tags: ['électrique', 'sportive', 'autonome']
  },
  {
    _id: '5',
    brand: 'Volkswagen',
    model: 'ID.3',
    price: 35000,
    year: 2024,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    description: 'Compacte électrique moderne',
    type: 'electric',
    fuel: 'Électrique',
    transmission: 'Automatique',
    power: '204 ch',
    engineSize: 'Électrique',
    doors: 5,
    seats: 5,
    color: 'Gris',
    mileage: 2000,
    available: true,
    featured: false,
    tags: ['électrique', 'compacte', 'écologique']
  },
  {
    _id: '6',
    brand: 'BMW',
    model: 'iX',
    price: 85000,
    year: 2024,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    description: 'SUV électrique de luxe',
    type: 'electric',
    fuel: 'Électrique',
    transmission: 'Automatique',
    power: '326 ch',
    engineSize: 'Électrique',
    doors: 5,
    seats: 5,
    color: 'Noir',
    mileage: 1000,
    available: true,
    featured: true,
    tags: ['électrique', 'luxe', 'suv']
  },
  {
    _id: '7',
    brand: 'Toyota',
    model: 'Prius',
    price: 32000,
    year: 2023,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
    description: 'Hybride économique et fiable',
    type: 'hybrid',
    fuel: 'Hybride',
    transmission: 'Automatique',
    power: '122 ch',
    engineSize: '1.8L Hybride',
    doors: 5,
    seats: 5,
    color: 'Argent',
    mileage: 8000,
    available: true,
    featured: false,
    tags: ['hybride', 'économique', 'écologique']
  },
  {
    _id: '8',
    brand: 'Porsche',
    model: '911',
    price: 120000,
    year: 2024,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    description: 'Sportive iconique et puissante',
    type: 'thermal',
    fuel: 'Essence',
    transmission: 'Automatique',
    power: '385 ch',
    engineSize: '3.0L',
    doors: 2,
    seats: 4,
    color: 'Rouge',
    mileage: 500,
    available: true,
    featured: true,
    tags: ['sportive', 'luxe', 'performance']
  },
  {
    _id: '9',
    brand: 'Lexus',
    model: 'RX 450h',
    price: 70000,
    year: 2023,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800',
    description: 'SUV hybride luxueux',
    type: 'hybrid',
    fuel: 'Hybride',
    transmission: 'Automatique',
    power: '313 ch',
    engineSize: '3.5L Hybride',
    doors: 5,
    seats: 5,
    color: 'Noir',
    mileage: 10000,
    available: true,
    featured: true,
    tags: ['hybride', 'luxe', 'suv']
  },
  {
    _id: '10',
    brand: 'Audi',
    model: 'e-tron',
    price: 80000,
    year: 2024,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    description: 'SUV électrique premium',
    type: 'electric',
    fuel: 'Électrique',
    transmission: 'Automatique',
    power: '408 ch',
    engineSize: 'Électrique',
    doors: 5,
    seats: 5,
    color: 'Gris',
    mileage: 3000,
    available: true,
    featured: true,
    tags: ['électrique', 'premium', 'suv']
  }
];

// Utilisateurs simulés
export const mockUsers = [
  {
    _id: 'user1',
    name: 'Admin GBA',
    email: 'admin@gba.com',
    role: 'admin',
    phone: '+225 05 03 71 33 15',
    createdAt: '2025-08-31T10:00:00.000Z'
  },
  {
    _id: 'user2',
    name: 'Annie Client',
    email: 'annie@gba.com',
    role: 'client',
    phone: '-',
    createdAt: '2025-09-02T14:30:00.000Z'
  }
];

// Commandes simulées
export const mockOrders = [
  {
    _id: 'order1',
    userId: 'user2',
    vehicleId: '1',
    vehicleName: 'BMW X5',
    startDate: '2026-02-01',
    endDate: '2026-02-05',
    totalPrice: 300000,
    status: 'validated',
    createdAt: '2025-11-25T10:00:00.000Z',
    validatedAt: '2025-11-26T14:00:00.000Z'
  },
  {
    _id: 'order2',
    userId: 'user2',
    vehicleId: '2',
    vehicleName: 'Mercedes-Benz Classe E',
    startDate: '2026-01-15',
    endDate: '2026-01-20',
    totalPrice: 325000,
    status: 'completed',
    createdAt: '2025-11-10T09:00:00.000Z',
    validatedAt: '2025-11-11T10:00:00.000Z',
    completedAt: '2026-01-20T18:00:00.000Z'
  }
];

// Classe pour gérer le stockage local
class LocalStorage {
  constructor(key, initialData = []) {
    this.key = key;
    this.initialData = initialData;
    this.init();
  }

  init() {
    const existing = localStorage.getItem(this.key);
    if (!existing || existing === '[]' || JSON.parse(existing).length < this.initialData.length) {
      // Réinitialiser si vide ou moins de données que prévu
      localStorage.setItem(this.key, JSON.stringify(this.initialData));
      console.log(`✅ ${this.key} initialisé avec ${this.initialData.length} éléments`);
    }
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  getById(id) {
    const items = this.getAll();
    return items.find(item => item._id === id || item.id === id);
  }

  create(item) {
    const items = this.getAll();
    const newItem = {
      ...item,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  update(id, updates) {
    const items = this.getAll();
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      localStorage.setItem(this.key, JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  delete(id) {
    const items = this.getAll();
    const filtered = items.filter(item => item._id !== id && item.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
    return true;
  }
}

// Instances de stockage
export const vehiclesStorage = new LocalStorage('mock_vehicles', mockVehicles);
export const usersStorage = new LocalStorage('mock_users', mockUsers);
export const ordersStorage = new LocalStorage('mock_orders', mockOrders);

// API simulée
export const mockAPI = {
  // Véhicules
  vehicles: {
    getAll: () => Promise.resolve({ data: vehiclesStorage.getAll() }),
    getById: (id) => Promise.resolve({ data: vehiclesStorage.getById(id) }),
    create: (data) => Promise.resolve({ data: vehiclesStorage.create(data) }),
    update: (id, data) => Promise.resolve({ data: vehiclesStorage.update(id, data) }),
    delete: (id) => {
      vehiclesStorage.delete(id);
      return Promise.resolve({ data: { message: 'Véhicule supprimé' } });
    }
  },

  // Utilisateurs
  users: {
    getAll: () => Promise.resolve({ data: usersStorage.getAll() }),
    getById: (id) => Promise.resolve({ data: usersStorage.getById(id) }),
    create: (data) => Promise.resolve({ data: usersStorage.create(data) }),
    update: (id, data) => Promise.resolve({ data: usersStorage.update(id, data) }),
    delete: (id) => {
      usersStorage.delete(id);
      return Promise.resolve({ data: { message: 'Utilisateur supprimé' } });
    }
  },

  // Commandes
  orders: {
    getAll: () => Promise.resolve({ data: ordersStorage.getAll() }),
    getById: (id) => Promise.resolve({ data: ordersStorage.getById(id) }),
    create: (data) => Promise.resolve({ data: ordersStorage.create(data) }),
    update: (id, data) => Promise.resolve({ data: ordersStorage.update(id, data) }),
    delete: (id) => {
      ordersStorage.delete(id);
      return Promise.resolve({ data: { message: 'Commande supprimée' } });
    }
  },

  // Stats
  stats: {
    get: () => {
      const vehicles = vehiclesStorage.getAll();
      const users = usersStorage.getAll();
      const orders = ordersStorage.getAll();
      
      return Promise.resolve({
        data: {
          totalVehicles: vehicles.length,
          totalUsers: users.length,
          totalOrders: orders.length,
          availableVehicles: vehicles.filter(v => v.available).length,
          pendingOrders: orders.filter(o => o.status === 'en_attente').length,
          validatedOrders: orders.filter(o => o.status === 'validated').length,
          completedOrders: orders.filter(o => o.status === 'completed').length
        }
      });
    }
  }
};
