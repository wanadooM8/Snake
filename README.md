# 🐍 Snake Game - Version Pastel

Un jeu classique du serpent revisité avec une interface moderne et des couleurs pastel douces.

![Snake Game](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Fonctionnalités

- 🎨 **Interface pastel mignonne** - Design moderne avec des couleurs douces et apaisantes
- 🎮 **Gameplay classique** - Mangez des pommes et grandissez sans vous cogner
- 🏆 **Système de score** - Meilleur score sauvegardé localement
- ⚙️ **Paramètres personnalisables** - Ajustez la vitesse et la difficulté
- 📱 **Responsive** - Jouable sur mobile, tablette et desktop
- 🎯 **Contrôles tactiles** - Support complet pour les écrans tactiles
- 🌿 **Obstacles décoratifs** - Petits buissons en arrière-plan pour l'esthétique
- 💀 **Game Over animé** - Écran de fin de partie avec overlay élégant

## 🎮 Comment jouer

### Sur ordinateur
- Utilisez les **flèches directionnelles** ⬆️ ⬇️ ⬅️ ➡️ pour contrôler le serpent
- Appuyez sur **Espace** pour mettre en pause

### Sur mobile/tablette
- Utilisez les **boutons tactiles** en bas de l'écran
- Tapez sur **Pause** pour arrêter temporairement

### Règles
1. 🍎 Mangez les pommes rouges pour gagner des points
2. 🐍 Le serpent grandit à chaque pomme mangée
3. 💥 Évitez les murs et votre propre corps
4. 🌿 Les buissons sont purement décoratifs (vous pouvez les traverser)

## 🚀 Installation

1. **Clonez le repository**
```bash
git clone https://github.com/wanadooM8/Snake.git
cd Snake
```

2. **Ouvrez le jeu**
- Double-cliquez sur `index.html`
- Ou utilisez un serveur local :
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server
```

3. **Jouez !**
- Ouvrez votre navigateur à `http://localhost:8000`

## 📁 Structure du projet

```
snake/
│
├── index.html          # Structure HTML principale
├── styles.css          # Styles CSS avec thème pastel
├── script.js           # Logique du jeu en JavaScript
└── README.md           # Documentation (ce fichier)
```

## 🎨 Palette de couleurs

Le jeu utilise une palette pastel douce :

- **Rose pastel** : `#ffc0e1` - Éléments principaux
- **Bleu pastel** : `#b0d4ff` - Score et accents
- **Vert pastel** : `#b8e6b8` - Buissons décoratifs
- **Jaune pastel** : `#ffe4b5` - Accents secondaires
- **Crème** : `#fef9f3` - Arrière-plan du canvas
- **Serpent** : `#5a9fff` - Bleu saturé
- **Pomme** : `#ff4444` - Rouge vif

## ⚙️ Configuration

Le jeu offre plusieurs paramètres ajustables :

- **Vitesse** : Lente, Normale, Rapide, Ultra
- **Difficulté** : Facile, Normal, Difficile
- **Pause** : Mettez le jeu en pause à tout moment

Les paramètres sont accessibles via la barre latérale sur desktop, ou en bas de l'écran sur mobile.

## 🔧 Technologies utilisées

- **HTML5 Canvas** - Rendu graphique du jeu
- **CSS3** - Styles modernes avec Flexbox et Grid
- **JavaScript (Vanilla)** - Logique du jeu sans framework
- **LocalStorage** - Sauvegarde du meilleur score

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge (dernières versions)
- ✅ Responsive : Desktop, Tablette, Mobile
- ✅ Support tactile complet
- ✅ Optimisé pour tous les écrans

## 🎯 Fonctionnalités techniques

- **Game loop** avec `requestAnimationFrame` pour des animations fluides
- **Système de grille** pour un mouvement précis
- **Détection de collision** avec les bordures, le corps et les obstacles
- **Génération procédurale** des obstacles décoratifs
- **Sauvegarde persistante** du meilleur score
- **Design responsive** avec breakpoints adaptatifs

## 🐛 Problèmes connus

Aucun problème majeur connu pour le moment. Si vous rencontrez un bug, n'hésitez pas à ouvrir une issue !

## 📝 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout de fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 👨‍💻 Auteur

**wanadooM8** - [GitHub Profile](https://github.com/wanadooM8)

---

⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile sur GitHub !

🎮 Bon jeu et amusez-vous bien ! 🐍
