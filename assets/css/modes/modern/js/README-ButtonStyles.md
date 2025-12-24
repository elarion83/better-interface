# Système d'exclusion des styles de boutons modernes

Ce document explique comment exclure facilement certaines propriétés CSS du style moderne sur des boutons spécifiques.

## 🎯 **Méthodes d'exclusion disponibles**

### **1. Attributs data (Recommandé)**

Ajoutez simplement un attribut `data-*` à votre bouton :

```html
<!-- Exclure le border-radius -->
<button data-no-border-radius>Mon bouton</button>

<!-- Exclure l'ombre -->
<button data-no-shadow>Mon bouton</button>

<!-- Exclure le gradient -->
<button data-no-gradient>Mon bouton</button>

<!-- Exclure les transitions -->
<button data-no-transition>Mon bouton</button>

<!-- Exclure les effets hover -->
<button data-no-hover>Mon bouton</button>

<!-- Combiner plusieurs exclusions -->
<button data-no-border-radius data-no-shadow>Mon bouton</button>
```

### **2. Classes CSS directes**

Ajoutez directement la classe CSS à votre bouton :

```html
<button class="ngWPAdminUI-no-border-radius">Mon bouton</button>
<button class="ngWPAdminUI-no-shadow">Mon bouton</button>
<button class="ngWPAdminUI-no-gradient">Mon bouton</button>
<button class="ngWPAdminUI-no-transition">Mon bouton</button>
<button class="ngWPAdminUI-no-hover">Mon bouton</button>
```

### **3. Configuration JavaScript**

Modifiez le fichier `modernButtonStyles.js` pour configurer des exclusions par sélecteur :

```javascript
// Dans modernButtonStylesConfig.propertyExclusions
propertyExclusions: {
    '.mon-bouton-specifique': ['border-radius', 'shadow'],
    '.bouton-carre': ['border-radius'],
    '.bouton-plat': ['shadow', 'gradient']
}
```

## 📋 **Classes d'exclusion disponibles**

| Classe CSS | Effet | Attribut data équivalent |
|------------|-------|--------------------------|
| `.ngWPAdminUI-no-border-radius` | Supprime le border-radius | `data-no-border-radius` |
| `.ngWPAdminUI-no-shadow` | Supprime l'ombre | `data-no-shadow` |
| `.ngWPAdminUI-no-gradient` | Remplace le gradient par une couleur unie | `data-no-gradient` |
| `.ngWPAdminUI-no-transition` | Supprime les transitions | `data-no-transition` |
| `.ngWPAdminUI-no-hover` | Supprime les effets au hover | `data-no-hover` |

## 🎨 **Exemples pratiques**

### **Bouton carré sans border-radius**
```html
<button data-no-border-radius>Bouton carré</button>
```

### **Bouton plat sans ombre ni gradient**
```html
<button data-no-shadow data-no-gradient>Bouton plat</button>
```

### **Bouton statique sans animations**
```html
<button data-no-transition data-no-hover>Bouton statique</button>
```

## ⚡ **Avantages**

- **Simple** : Ajoutez juste un attribut `data-*`
- **Flexible** : Combinez plusieurs exclusions
- **Maintenable** : Configuration centralisée
- **Performance** : Pas de JavaScript supplémentaire
- **Rétrocompatible** : Fonctionne avec le système existant

## 🔧 **Personnalisation avancée**

Pour ajouter de nouvelles classes d'exclusion :

1. **Ajoutez la classe CSS** dans `modern.css`
2. **Ajoutez l'attribut data** dans `modernButtonStyles.js`
3. **Documentez** dans ce README

```javascript
// Dans modernButtonStylesConfig.dataExclusions
dataExclusions: {
    'data-no-border-radius': 'ngWPAdminUI-no-border-radius',
    'data-no-shadow': 'ngWPAdminUI-no-shadow',
    'data-ma-nouvelle-exclusion': 'ngWPAdminUI-ma-nouvelle-classe'
}
```
