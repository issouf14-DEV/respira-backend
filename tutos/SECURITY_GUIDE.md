# 🛡️ GUIDE DE SÉCURITÉ - RESPIRA BACKEND

## ⚠️ ALERTE SÉCURITÉ RÉSOLUE

**PROBLÈME DÉTECTÉ** : Des clés API sensibles étaient exposées publiquement dans ce dépôt GitHub.

**ACTIONS CORRECTIVES PRISES** :
1. ✅ Clés API exposées supprimées des fichiers de documentation
2. ✅ Nouvelle SECRET_KEY Django générée
3. ✅ Fichiers .env sécurisés et exclus de Git
4. ✅ .gitignore renforcé pour prévenir les fuites futures

---

## 🔒 Bonnes pratiques de sécurité

### 1. Variables d'environnement

**✅ À FAIRE :**
- Utiliser des fichiers `.env` pour toutes les variables sensibles
- Ne JAMAIS commiter les fichiers `.env` dans Git
- Utiliser `.env.example` comme template (sans valeurs réelles)
- Utiliser différents environnements (dev, staging, production)

**❌ À ÉVITER :**
- Hardcoder des clés API dans le code source
- Commiter des fichiers `.env` contenant des vraies valeurs
- Partager des secrets via email ou chat

### 2. Clés API et Secrets

**Rotation des clés** : Changez vos clés API régulièrement
- OpenWeather API : Connectez-vous à https://openweathermap.org/api et générez une nouvelle clé
- IQAir API : Connectez-vous à https://iqair.com/dashboard/api et créez une nouvelle clé

**Django SECRET_KEY** : Générez une nouvelle clé pour chaque environnement :
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Base de données

**Mots de passe forts** : Utilisez des mots de passe complexes
```
# Exemple de mot de passe fort
DB_PASSWORD=Kp9$mN2!xQ7vZ#Lw5rY8@Rt4nE6uS1
```

### 4. Production

**Configuration de production** :
- `DEBUG=False` toujours
- `ALLOWED_HOSTS` configuré avec vos vrais domaines
- HTTPS activé (`SECURE_SSL_REDIRECT=True`)
- Firewall configuré
- Monitoring des logs activé

### 5. Git et GitHub

**Vérification avant commit** :
```bash
# Vérifiez qu'aucun secret n'est dans votre commit
git diff --cached | grep -E "(SECRET|PASSWORD|API_KEY|TOKEN)"

# Si des secrets apparaissent, annulez le commit
git reset HEAD~1
```

**Scan de sécurité** : Activez GitHub Dependabot et Secret Scanning

---

## 🚨 En cas de fuite de clés

### Actions immédiates :

1. **Révoquer immédiatement** toutes les clés exposées
2. **Générer de nouvelles clés** sur les plateformes concernées
3. **Nettoyer l'historique Git** si nécessaire :
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
4. **Forcer un push** pour nettoyer l'historique distant
5. **Surveiller** les accès suspects sur vos comptes

### Monitoring :

- Surveillez les logs d'accès de vos APIs
- Configurez des alertes pour des utilisations anormales
- Vérifiez régulièrement vos factures API

---

## 📋 Checklist de sécurité

- [ ] Tous les fichiers `.env*` sont dans `.gitignore`
- [ ] Aucune clé réelle dans le code source ou documentation
- [ ] Mots de passe de base de données complexes
- [ ] Django SECRET_KEY unique par environnement
- [ ] DEBUG=False en production
- [ ] HTTPS configuré en production
- [ ] Monitoring des erreurs activé
- [ ] Sauvegardes régulières de la base de données
- [ ] Mise à jour régulière des dépendances
- [ ] Scan de vulnérabilités activé

---

## 📞 Contact

En cas de découverte de vulnérabilité, contactez immédiatement l'équipe de développement.

**Date de dernière mise à jour** : 2 décembre 2025