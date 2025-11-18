# Boxy Generator

Une application **React + Redux Toolkit** permettant de personnaliser en temps réel les propriétés visuelles d’un élément HTML (taille, couleur, bordures, ombres portées).  
Le but est de fournir une interface intuitive avec **sliders**, **color pickers** et **panneaux dynamiques** pour créer rapidement des designs personnalisés.

---

## 🚀 Fonctionnalités

- 📏 **Contrôles dynamiques** : ajustez largeur, hauteur, border radius, etc.
- 🎨 **Choix de couleurs** via un color picker intégré.
- 🌫 **Gestion d’ombres multiples** avec réglages précis
- 🔄 **Mise à jour en temps réel** grâce à Redux Toolkit
- 📦 **Composants réutilisables**
- 🎯 **Interface responsive** avec Tailwind CSS

---

## 🛠 Stack technique

- **React** (hooks)
- **Redux Toolkit** pour la gestion d’état
- **Tailwind CSS** pour le style
- **Vite** pour le bundling et le serveur de développement
- **NanoID** pour générer des identifiants uniques

---

## 📂 Structure du projet
src/
├── assets/ # Images, icônes (chevron, etc.)
├── features/ # Slices Redux (boxProperties, shadow, etc.)
│ ├── boxProperties.js
│ └── shadow.js
├── Layout/ # Composants de layout (ShadowList, Shadow, etc.)
├── Components/
│ ├── BoxRange/ # Slider et input numérique synchronisés
│ ├── BoxColorPicker/ # Sélecteur de couleur
│ └── ...
├── App.jsx # Composant racine
├── main.jsx # Point d’entrée React
└── store.js # Configuration Redux

---

🤝 **Contribution**

Les contributions sont bienvenues !

1. Fork le projet
2. Crée une branche (`git checkout -b feature/ta-fonctionnalite`)
3. Commit tes changements (`git commit -m 'Ajout de la fonctionnalité'`)
4. Push sur ta branche (`git push origin feature/ta-fonctionnalite`)
5. Ouvre une Pull Request

## 📧 Contact

- **Auteur** : FOFANA ISSOUF
- **Email** : fofanaissouf179@gmail.com
- **GitHub** : https://github.com/issouf14-DEV
