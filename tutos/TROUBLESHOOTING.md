# 🔧 Guide de résolution des problèmes

## Problèmes courants et solutions

### 1. Docker n'est pas reconnu

**Problème**: `docker: Le terme 'docker' n'est pas reconnu`

**Solution**:
```powershell
# Ajouter Docker au PATH
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Vérifier
docker --version
```

### 2. Les conteneurs ne démarrent pas

**Problème**: `docker compose up -d` échoue

**Solutions**:
```powershell
# Vérifier que Docker Desktop est lancé
# Regarder les logs
docker compose logs

# Reconstruire les images
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 3. Erreur de connexion à la base de données

**Problème**: `OperationalError: could not connect to server`

**Solutions**:
```powershell
# Vérifier que PostgreSQL tourne
docker compose ps

# Redémarrer les services
docker compose restart db
docker compose restart web

# Vérifier les variables d'environnement dans .env
```

### 4. Migrations non appliquées

**Problème**: `You have X unapplied migration(s)`

**Solution**:
```powershell
# Créer les migrations
docker compose exec web python manage.py makemigrations

# Appliquer les migrations
docker compose exec web python manage.py migrate
```

### 5. Module 'requests' introuvable

**Problème**: `ModuleNotFoundError: No module named 'requests'`

**Solution**:
```powershell
# Reconstruire l'image avec les dépendances
docker compose build --no-cache web
docker compose up -d
```

### 6. Erreur CORS

**Problème**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
Vérifier `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

Ou dans `base.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Uniquement en développement
```

### 7. Token JWT invalide

**Problème**: `Given token not valid for any token type`

**Solution**:
```powershell
# Se reconnecter pour obtenir un nouveau token
$loginBody = @{
    email = 'user@example.com'
    password = 'password'
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/users/auth/login/ -Method POST -Body $loginBody -ContentType 'application/json'
$tokens = $response.Content | ConvertFrom-Json
```

### 8. Port 8000 déjà utilisé

**Problème**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solutions**:
```powershell
# Trouver le processus utilisant le port
netstat -ano | findstr :8000

# Arrêter le processus (remplacer PID)
Stop-Process -Id PID -Force

# Ou changer le port dans docker-compose.yml
ports:
  - "8001:8000"
```

### 9. Erreur de permission dans Docker

**Problème**: `Permission denied` dans les conteneurs

**Solution**:
```powershell
# Reconstruire sans cache
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### 10. Staticfiles non trouvés

**Problème**: `You're seeing this error because DEBUG=True`

**Solution**:
```powershell
# Collecter les fichiers statiques
docker compose exec web python manage.py collectstatic --noinput

# Redémarrer
docker compose restart web
```

## Commandes de diagnostic

### Vérifier l'état des services
```powershell
docker compose ps
docker compose logs web --tail=50
docker compose logs db --tail=50
```

### Vérifier les variables d'environnement
```powershell
docker compose exec web env | grep -E 'DB_|SECRET_|CORS_'
```

### Accéder au shell Django
```powershell
docker compose exec web python manage.py shell
```

### Tester la connexion à la base de données
```powershell
docker compose exec web python manage.py dbshell
```

### Nettoyer complètement
```powershell
# Arrêter et supprimer tout
docker compose down -v

# Supprimer les images
docker compose down --rmi all

# Reconstruire de zéro
docker compose build --no-cache
docker compose up -d
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

## Erreurs Python/Django spécifiques

### Import Error
```powershell
# Vérifier la structure des apps
docker compose exec web python -c "import apps.users.models; print('OK')"
```

### Database Lock
```powershell
# Redémarrer PostgreSQL
docker compose restart db
```

### Circular Import
Vérifier l'ordre des imports dans les fichiers Python. Les imports relatifs doivent être après les imports absolus.

## Performance

### Build trop lent
```powershell
# Utiliser le cache de build
docker compose build

# Augmenter la mémoire de Docker Desktop
# Settings > Resources > Advanced > Memory
```

### API lente
```powershell
# Activer le cache Redis (production)
# Optimiser les requêtes avec select_related/prefetch_related
# Ajouter des index sur les champs fréquemment recherchés
```

## Vérification de santé

### Script de santé rapide
```powershell
# test_health.ps1
$services = @("http://localhost:8000/admin/", "http://localhost:8000/api/v1/users/me/")

foreach ($url in $services) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -ErrorAction Stop
        Write-Host "✓ $url - OK" -ForegroundColor Green
    } catch {
        Write-Host "✗ $url - ERREUR" -ForegroundColor Red
    }
}
```

## Support supplémentaire

Si le problème persiste :
1. Vérifier les logs complets: `docker compose logs -f`
2. Consulter la documentation Django: https://docs.djangoproject.com/
3. Vérifier les issues GitHub du projet
4. Redémarrer Docker Desktop
5. Redémarrer votre ordinateur (parfois nécessaire)

## Logs utiles

```powershell
# Tous les logs
docker compose logs

# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs web
docker compose logs db

# Dernières 100 lignes
docker compose logs --tail=100
```

## Nettoyage de l'environnement

### Supprimer les containers et volumes
```powershell
docker compose down -v
```

### Supprimer les images non utilisées
```powershell
docker system prune -a
```

### Libérer de l'espace
```powershell
docker system df
docker volume prune
docker image prune -a
```
