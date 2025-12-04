// Images de voitures de haute qualité depuis Unsplash (gratuites)

export const carImages = {
  // Voitures de luxe modernes
  luxury1: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
  luxury2: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80',
  luxury3: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
  
  // SUV
  suv1: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
  suv2: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&q=80',
  suv3: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
  
  // Berlines sportives
  sport1: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  sport2: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
  sport3: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
  
  // Voitures familiales
  family1: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  family2: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
  family3: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
  
  // Voitures électriques
  electric1: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
  electric2: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
  electric3: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80',
  
  // Voitures de prestige
  prestige1: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80',
  prestige2: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
  prestige3: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  
  // Image par défaut
  default: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
};

// Fonction pour obtenir une image aléatoire
export const getRandomCarImage = () => {
  const images = Object.values(carImages);
  return images[Math.floor(Math.random() * images.length)];
};

// Images pour les catégories
export const categoryImages = {
  sedan: carImages.sport1,
  suv: carImages.suv1,
  luxury: carImages.luxury1,
  electric: carImages.electric1,
  family: carImages.family1,
  prestige: carImages.prestige1,
};

export default carImages;
