# Better Interface - Styles Modernes

## 🎯 Approche par Inclusion

Cette nouvelle approche remplace l'ancienne méthode par exclusion (`:not`) par une approche plus robuste et maintenable.

### 📁 Structure des fichiers

```
assets/css/modes/modern/js/
├── customActionsButtons.js    # Configuration des boutons d'actions
├── modernStyles.js           # Application automatique des styles boutons
├── modernFormStyles.js       # Application automatique des styles formulaires
└── README.md                 # Cette documentation
```

### 🔧 Configuration des boutons d'actions

#### Paramètres disponibles pour chaque action :

```javascript
{
    buttonClass: 'ngBetterInterface-trash-button',     // Classe CSS du bouton
    title: 'Move to trash',                            // Titre du bouton
    icon: '<span class="dashicons dashicons-trash"></span>', // Icône
    group: null,                                       // Groupe (pour les boutons liés)
    backgroundColor: '#dc3545',                        // Couleur de fond normale
    hoverBackgroundColor: '#c82333'                    // Couleur de fond au survol
}
```

#### Couleurs par défaut :

- **Trash/Delete** : Rouge (`#dc3545` → `#c82333`)
- **Approve/Activate** : Vert (`#28a745` → `#218838`)
- **Unapprove/Deactivate** : Rouge (`#dc3545` → `#c82333`)
- **Edit** : Bleu (`#17a2b8` → `#138496`)
- **Update** : Jaune (`#ffc107` → `#e0a800`)
- **Spam** : Orange (`#fd7e14` → `#e8690b`)
- **Unspam** : Violet (`#6f42c1` → `#5a32a3`)
- **Reset Password** : Teal (`#20c997` → `#1ea085`)
- **Auto-update Enable** : Teal (`#20c997` → `#1ea085`)
- **Auto-update Disable** : Gris (`#6c757d` → `#5a6268`)

### 🔧 Classes CSS disponibles

#### Boutons
- `.ngBetterInterface-modern-button` : Style moderne pour les boutons `<button>`
- `input[type="button"].ngBetterInterface-modern-input` : Style moderne pour les inputs de type button
- `input[type="submit"].ngBetterInterface-modern-input` : Style moderne pour les inputs de type submit

#### Formulaires
- `input[type="text"].ngBetterInterface-modern-input` : Style moderne pour les champs texte
- `input[type="email"].ngBetterInterface-modern-input` : Style moderne pour les champs email
- `input[type="password"].ngBetterInterface-modern-input` : Style moderne pour les champs mot de passe
- `input[type="url"].ngBetterInterface-modern-input` : Style moderne pour les champs URL
- `input[type="number"].ngBetterInterface-modern-input` : Style moderne pour les champs numériques
- `textarea.ngBetterInterface-modern-input` : Style moderne pour les zones de texte
- `select.ngBetterInterface-modern-input` : Style moderne pour les listes déroulantes

### 🚀 Avantages de cette approche

1. **Robustesse** : Pas de conflits avec les plugins tiers
2. **Maintenabilité** : Configuration centralisée et lisible
3. **Performance** : Sélecteurs CSS plus simples
4. **Extensibilité** : Facile d'ajouter de nouveaux éléments
5. **Compatibilité** : Fonctionne avec tous les plugins WordPress

### 📝 Utilisation

#### Application automatique
Les styles sont appliqués automatiquement via JavaScript aux éléments appropriés.

#### Application manuelle
Vous pouvez aussi appliquer manuellement les classes :

```html
<!-- Boutons modernes -->
<button class="ngBetterInterface-modern-button">Mon bouton</button>
<input type="submit" class="ngBetterInterface-modern-input" value="Envoyer">
<input type="button" class="ngBetterInterface-modern-input" value="Annuler">

<!-- Champs de formulaire modernes -->
<input type="text" class="ngBetterInterface-modern-input" placeholder="Nom">
<input type="email" class="ngBetterInterface-modern-input" placeholder="Email">
<textarea class="ngBetterInterface-modern-input" placeholder="Message"></textarea>
<select class="ngBetterInterface-modern-input">
    <option>Option 1</option>
    <option>Option 2</option>
</select>
```

### ⚙️ Configuration

#### Ajouter un nouvel élément à styler
Dans `modernStyles.js` ou `modernFormStyles.js`, ajoutez le sélecteur dans le tableau `buttons` ou `inputs`.

#### Exclure un élément
Ajoutez le sélecteur dans le tableau `exclude` du fichier approprié.

### 🔄 Mise à jour automatique

Le système utilise :
- `MutationObserver` pour détecter les changements DOM
- `ajaxComplete` pour les requêtes AJAX
- Délais de 100ms pour la stabilité du DOM

### 🎨 Personnalisation

Les styles sont définis dans `modern.css` avec les variables CSS :
- `--ngBetterInterface-modern-primary`
- `--ngBetterInterface-modern-accent`
- `--ngBetterInterface-modern-bg-primary`
- `--ngBetterInterface-modern-border-color`
- `--ngBetterInterface-modern-text-primary`
