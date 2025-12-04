# 📝 AIDE-MÉMOIRE - Copier/Coller Rapide

## 🎯 Imports à Copier

### Toast
```jsx
import { useToast } from '../hooks/useToast';
```

### Validation
```jsx
import { useFormValidation, ValidatedInput, ValidatedSelect, ValidatedTextarea } from '../hooks/useFormValidation';
```

### Pagination
```jsx
import Pagination, { usePagination } from '../components/common/Pagination';
```

### Skeleton
```jsx
import { 
  VehiclesListSkeleton,
  VehicleCardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  OrdersListSkeleton,
  ProfileSkeleton,
  FormSkeleton
} from '../components/common/Skeleton';
```

### Images
```jsx
import { OptimizedImage, ImageGallery } from '../components/common/OptimizedImage';
```

### Filtres
```jsx
import { 
  useAdvancedFilter, 
  SearchBar, 
  FilterPanel, 
  FilterSelect, 
  FilterRange 
} from '../hooks/useAdvancedFilter';
```

### Export
```jsx
import { ExportButton, exportToCSV, exportToExcel, exportToPDF } from '../utils/export';
```

### Gestion Erreurs
```jsx
import { withErrorHandling, useAPIError, ErrorDisplay } from '../utils/errorHandling';
```

### Cache
```jsx
import { useCache, useDebounce, useThrottle } from '../hooks/useCache';
```

---

## 🔥 Patterns à Copier/Coller

### 1. Toast - Pattern Complet

```jsx
import { useToast } from '../hooks/useToast';

function MonComposant() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('✅ Opération réussie !');
  };

  const handleError = () => {
    toast.error('❌ Une erreur est survenue');
  };

  const handleWarning = () => {
    toast.warning('⚠ Attention, vérifiez vos données');
  };

  const handleInfo = () => {
    toast.info('ℹ Information utile');
  };

  return <button onClick={handleSuccess}>Tester</button>;
}
```

---

### 2. Validation - Pattern Complet

```jsx
import { useFormValidation, ValidatedInput } from '../hooks/useFormValidation';

function MonFormulaire() {
  const form = useFormValidation(
    {
      email: '',
      password: '',
      name: '',
      phone: ''
    },
    {
      email: { 
        required: 'Email requis', 
        email: true 
      },
      password: { 
        required: 'Mot de passe requis', 
        minLength: 6 
      },
      name: { 
        required: 'Nom requis', 
        minLength: 2 
      },
      phone: { 
        phone: true 
      }
    }
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('Données valides:', data);
    // Votre logique ici
  });

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Email"
        name="email"
        type="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.errors.email}
        touched={form.touched.email}
        required
      />

      <ValidatedInput
        label="Mot de passe"
        name="password"
        type="password"
        value={form.values.password}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.errors.password}
        touched={form.touched.password}
        required
      />

      <button 
        type="submit" 
        disabled={form.isSubmitting}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        {form.isSubmitting ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
}
```

---

### 3. Pagination - Pattern Complet

```jsx
import Pagination, { usePagination } from '../components/common/Pagination';

function MaListe() {
  const [items, setItems] = useState([]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(items, 10); // 10 items par page

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {paginatedItems.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={items.length}
        itemsPerPage={10}
        onPageChange={goToPage}
      />
    </>
  );
}
```

---

### 4. Skeleton - Pattern Complet

```jsx
import { VehiclesListSkeleton } from '../components/common/Skeleton';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <VehiclesListSkeleton count={6} />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

---

### 5. Images Optimisées - Pattern Complet

```jsx
import { OptimizedImage, ImageGallery } from '../components/common/OptimizedImage';

// Image simple
function MonImage() {
  return (
    <OptimizedImage
      src="/path/to/image.jpg"
      alt="Description"
      className="w-full h-64 object-cover rounded-lg"
    />
  );
}

// Galerie
function MaGalerie() {
  const images = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg'
  ];

  return (
    <ImageGallery
      images={images}
      alt="Véhicule"
    />
  );
}
```

---

### 6. Recherche + Filtres - Pattern Complet

```jsx
import { 
  useAdvancedFilter, 
  SearchBar, 
  FilterPanel, 
  FilterSelect, 
  FilterRange 
} from '../hooks/useAdvancedFilter';
import Pagination, { usePagination } from '../components/common/Pagination';

function MaListe() {
  const [items, setItems] = useState([]);

  // Extraire valeurs uniques pour filtres
  const uniqueCategories = [...new Set(items.map(i => i.category))];
  const priceRange = items.length > 0 
    ? { min: Math.min(...items.map(i => i.price)), max: Math.max(...items.map(i => i.price)) }
    : { min: 0, max: 1000 };

  // Filtrage
  const {
    filteredItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearAllFilters,
    activeFiltersCount,
    toggleSort,
    sortBy,
    sortOrder
  } = useAdvancedFilter(items, {
    searchFields: ['name', 'description'],
    filterConfig: {
      category: { type: 'select' },
      price: { type: 'range' }
    }
  });

  // Pagination
  const { paginatedItems, ...pagination } = usePagination(filteredItems, 12);

  return (
    <>
      {/* Recherche */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher..."
      />

      {/* Filtres */}
      <FilterPanel
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearAllFilters}
      >
        <FilterSelect
          label="Catégorie"
          value={filters.category}
          onChange={(val) => setFilter('category', val)}
          options={uniqueCategories.map(c => ({ value: c, label: c }))}
        />

        <FilterRange
          label="Prix"
          value={filters.price || priceRange}
          onChange={(val) => setFilter('price', val)}
          min={priceRange.min}
          max={priceRange.max}
          unit="€"
        />

        {/* Tri */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Trier par</label>
          <button
            onClick={() => toggleSort('price')}
            className={`px-4 py-2 rounded-lg ${sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Prix {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </FilterPanel>

      {/* Résultats */}
      <p className="text-gray-600 mb-4">
        {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''}
      </p>

      {/* Liste */}
      <div className="grid grid-cols-3 gap-4">
        {paginatedItems.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination {...pagination} totalItems={filteredItems.length} itemsPerPage={12} />
    </>
  );
}
```

---

### 7. Export - Pattern Complet

```jsx
import { ExportButton } from '../utils/export';

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  // Formater les données pour l'export
  const exportData = orders.map(order => ({
    'ID Commande': order._id,
    'Client': order.userName,
    'Email': order.userEmail,
    'Téléphone': order.userPhone,
    'Véhicule': order.vehicle?.name,
    'Prix Total': order.totalPrice + '€',
    'Date Début': order.startDate,
    'Date Fin': order.endDate,
    'Statut': order.status,
    'Date Création': new Date(order.createdAt).toLocaleDateString('fr-FR')
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Commandes</h1>
        <ExportButton 
          data={exportData}
          filename={`commandes-${new Date().toISOString().split('T')[0]}`}
        />
      </div>
      
      {/* Votre tableau */}
    </div>
  );
}
```

---

### 8. Gestion Erreurs - Pattern Complet

```jsx
import { useAPIError, ErrorDisplay } from '../utils/errorHandling';

function MonComposant() {
  const { error, handleError, retry, clearError, canRetry } = useAPIError();

  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (err) {
      handleError(err);
    }
  };

  const retryFetch = async () => {
    clearError();
    await fetchData();
  };

  return (
    <>
      <ErrorDisplay 
        error={error}
        onRetry={canRetry ? retryFetch : null}
        onDismiss={clearError}
      />
      
      {/* Votre contenu */}
    </>
  );
}
```

---

## 🎨 Styles CSS Utiles

```css
/* Animations smooth */
.transition-smooth {
  transition: all 0.3s ease-in-out;
}

/* Hover scale */
.hover-scale:hover {
  transform: scale(1.05);
}

/* Gradient background */
.gradient-red {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

/* Card shadow */
.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-shadow:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

---

## 🚀 Raccourcis Clavier Utiles

### Dans VSCode:
- `Ctrl + D` - Sélectionner occurrence suivante
- `Alt + Click` - Multi-curseur
- `Ctrl + /` - Commenter/décommenter
- `Ctrl + Space` - Autocomplétion
- `F2` - Renommer symbole

### Dans le navigateur:
- `Ctrl + Shift + I` - DevTools
- `Ctrl + Shift + C` - Inspecteur
- `Ctrl + Shift + R` - Hard refresh (cache)

---

## 💡 Snippets Utiles

### useEffect avec cleanup
```jsx
useEffect(() => {
  // Setup
  
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### Fetch avec loading et error
```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Debounced search
```jsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 📋 Checklist Rapide

### Avant chaque commit:
- [ ] Code fonctionne
- [ ] Pas d'erreurs console
- [ ] Tests manuels OK
- [ ] Code formaté
- [ ] Commit message clair

### Avant le build:
- [ ] Toutes les dépendances installées
- [ ] Variables d'environnement OK
- [ ] `npm run build` réussit
- [ ] `npm run preview` fonctionne

---

**Copiez ce fichier et gardez-le sous la main pendant le développement ! 📌**
