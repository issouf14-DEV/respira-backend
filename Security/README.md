# 🔒 Security Directory - Respira Backend

## Overview
Ce dossier centralise tous les fichiers, scripts et documentation liés à la sécurité du projet Respira Backend.

## Structure du Dossier

### 📂 `/scripts`
Scripts d'automatisation pour la sécurité et les vulnérabilités:
- `check_github_dependabot.py` - Vérification des alertes Dependabot
- `eradicate_vulnerabilities.py` - Éradication des vulnérabilités connues
- `fix_urllib3_vulnerabilities.py` - Correctifs spécifiques urllib3
- `security_audit.py` - Audit de sécurité complet
- `update_security.py` - Mise à jour des packages de sécurité
- `validate_security.py` - Validation des configurations de sécurité
- `validate_security_fixes.py` - Validation des correctifs appliqués
- `validate_final_security.py` - Validation finale de sécurité
- `install_security_fixes.ps1` - Installation des correctifs (PowerShell)
- `update_security_packages.ps1` - Mise à jour des packages (PowerShell)
- `generate_advanced_test_data.py` - Génération de données de test sécurisées

### 📂 `/core`
Modules Python pour la sécurité intégrée:
- `security.py` - Module de sécurité principal
- `security_final.py` - Configuration de sécurité finale
- `brutal_security_override.py` - Surcharges de sécurité renforcées
- `secure_requests.py` - Requêtes HTTP sécurisées
- `requests_security_patch.py` - Patches pour la bibliothèque requests
- `urllib3_security_patch.py` - Patches pour urllib3
- `ultra_security.py` - Sécurité ultra-renforcée
- `vulnerability_patches.py` - Patches de vulnérabilités

### 📂 `/docs`
Documentation sur la sécurité:
- `SECURITY_FIXES.md` - Liste des correctifs de sécurité appliqués
- `SECURITY_SUMMARY.md` - Résumé de la sécurité du projet
- `SECURITY_FINAL.md` - État final de la sécurité
- `SECURITY_FIXES_COMPLETE.md` - Historique complet des correctifs
- `SECURITY_RESOLVED.md` - Problèmes de sécurité résolus
- `SECURITY_VULNERABILITIES_FIXED.md` - Vulnérabilités corrigées
- `SECURITY_ULTRA_HARDENED_CLEAN.md` - Durcissement de la sécurité
- `SECURITY_UPDATE_README.md` - Guide de mise à jour de sécurité
- `SECURITY_HISTORY_RESET.md` - Historique de réinitialisation
- `GITHUB_DEPENDABOT_GUIDE.md` - Guide d'utilisation de Dependabot

### 📄 `security_requirements.txt`
Requirements Python spécifiques à la sécurité.

## Utilisation

### Audit de Sécurité
```bash
python Security/scripts/security_audit.py
```

### Mise à Jour des Packages de Sécurité
```bash
# Linux/Mac
python Security/scripts/update_security.py

# Windows
.\Security\scripts\update_security_packages.ps1
```

### Validation de la Sécurité
```bash
python Security/scripts/validate_security.py
```

### Vérification Dependabot
```bash
python Security/scripts/check_github_dependabot.py
```

## Meilleures Pratiques

1. **Mises à Jour Régulières**: Exécutez les scripts de mise à jour hebdomadairement
2. **Audit Mensuel**: Effectuez un audit complet de sécurité chaque mois
3. **Monitoring Dependabot**: Surveillez les alertes GitHub régulièrement
4. **Documentation**: Documentez tous les correctifs dans `/docs`
5. **Tests**: Validez chaque correctif avant déploiement

## Historique des Mises à Jour

- **Janvier 2026**: Réorganisation complète de la structure sécurité
  - Centralisation de tous les fichiers de sécurité
  - Amélioration de l'organisation et de la documentation
  - Mise à jour de tous les packages de sécurité

## Contact & Support

Pour toute question de sécurité, consultez d'abord la documentation dans `/docs`.

## License
Confidentiel - Projet Respira Backend
