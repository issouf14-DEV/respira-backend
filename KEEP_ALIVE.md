# Keep-Alive pour RespirIA Backend

Ce dossier contient les outils pour maintenir le serveur Render actif.

## 🔄 Endpoints ajoutés

### `/ping/` 
Ping simple pour vérifier si le serveur est actif
```bash
curl https://respira-backend.onrender.com/ping/
```

### `/wake-up/` 
Réveille le serveur s'il est endormi
```bash
curl https://respira-backend.onrender.com/wake-up/
```

### `/status/` 
Statut détaillé du serveur
```bash
curl https://respira-backend.onrender.com/status/
```

## 🚀 Pour le développeur Frontend

**URL à utiliser pour réveiller le serveur:**
```
https://respira-backend.onrender.com/wake-up/
```

**Instructions:**
1. Si l'app frontend retourne une erreur de connexion
2. Faire un appel GET sur `/wake-up/`
3. Attendre 30-60 secondes (cold start)
4. Retry les requêtes normales

## 🤖 Script automatique

Le fichier `keep_alive_external.py` peut être exécuté pour maintenir le serveur actif:

```bash
python keep_alive_external.py 10  # Ping toutes les 10 minutes
```

## ⏰ Services externes

### UptimeRobot (Gratuit)
1. Créer un compte sur uptimerobot.com
2. Ajouter un monitor HTTP
3. URL: `https://respira-backend.onrender.com/ping/`
4. Intervalle: 5 minutes

### Cron Job (Linux/Mac)
```bash
# Ajouter au crontab: ping toutes les 10 minutes
*/10 * * * * curl -s https://respira-backend.onrender.com/ping/ > /dev/null
```

## 📱 Pour l'app Flutter

```dart
// Fonction à appeler avant les requêtes importantes
Future<bool> wakeUpServer() async {
  try {
    final response = await http.get(
      Uri.parse('https://respira-backend.onrender.com/wake-up/'),
      headers: {'User-Agent': 'FlutterApp/1.0'},
    );
    
    if (response.statusCode == 200) {
      // Attendre un peu pour le cold start
      await Future.delayed(Duration(seconds: 10));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}
```