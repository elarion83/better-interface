# WP Admin UI - Styles Modernes

## 🎯 Approche par Inclusion

Cette nouvelle approche remplace l'ancienne méthode par exclusion (`:not`) par une approche plus robuste et maintenable.

### 📁 Structure des fichiers

```
assets/css/modes/modern/
├── js/
│   ├── customActionsButtons.js    # Configuration des boutons d'actions
│   ├── modernStyles.js           # Application automatique des styles boutons
│   ├── modernFormStyles.js       # Application automatique des styles formulaires
│   └── README.md                 # Cette documentation
└── plugins/
    ├── contact-form-7.css        # Styles spécifiques à Contact Form 7
    └── plugins.css               # Styles pour la page d'installation de plugins
```

### 🔧 Configuration des boutons d'actions

#### Paramètres disponibles pour chaque action :

```javascript
{
    buttonClass: 'ngWPAdminUI-trash-button',     // Classe CSS du bouton
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

### 🎨 Styles spécifiques aux plugins

Le plugin charge automatiquement des styles spécifiques pour certains plugins WordPress :

- **Contact Form 7** (`contact-form-7.css`) : Styles modernes pour les formulaires CF7
- **Page d'installation de plugins** (`plugins.css`) : Styles pour les cartes de plugins

Ces fichiers sont chargés automatiquement en mode moderne et peuvent être étendus selon les besoins.

### 🔧 Classes CSS disponibles

#### Boutons
- `.ngWPAdminUI-modern-button` : Style moderne pour les boutons `<button>`
- `input[type="button"].ngWPAdminUI-modern-input` : Style moderne pour les inputs de type button
- `input[type="submit"].ngWPAdminUI-modern-input` : Style moderne pour les inputs de type submit

#### Formulaires
- `input[type="text"].ngWPAdminUI-modern-input` : Style moderne pour les champs texte
- `input[type="email"].ngWPAdminUI-modern-input` : Style moderne pour les champs email
- `input[type="password"].ngWPAdminUI-modern-input` : Style moderne pour les champs mot de passe
- `input[type="url"].ngWPAdminUI-modern-input` : Style moderne pour les champs URL
- `input[type="number"].ngWPAdminUI-modern-input` : Style moderne pour les champs numériques
- `textarea.ngWPAdminUI-modern-input` : Style moderne pour les zones de texte
- `select.ngWPAdminUI-modern-input` : Style moderne pour les listes déroulantes

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
<button class="ngWPAdminUI-modern-button">Mon bouton</button>
<input type="submit" class="ngWPAdminUI-modern-input" value="Envoyer">
<input type="button" class="ngWPAdminUI-modern-input" value="Annuler">

<!-- Champs de formulaire modernes -->
<input type="text" class="ngWPAdminUI-modern-input" placeholder="Nom">
<input type="email" class="ngWPAdminUI-modern-input" placeholder="Email">
<textarea class="ngWPAdminUI-modern-input" placeholder="Message"></textarea>
<select class="ngWPAdminUI-modern-input">
    <option>Option 1</option>
    <option>Option 2</option>
</select>
```

### ⚙️ Configuration

#### Ajouter un nouvel élément à styler
Dans `modernButtonStyles.js` ou `modernFormStyles.js`, ajoutez le sélecteur dans le tableau `buttons` ou `inputs`.

#### Exclure un élément
Ajoutez le sélecteur dans le tableau `exclude` du fichier approprié.

### 🔄 Mise à jour automatique

Le système utilise :
- `MutationObserver` pour détecter les changements DOM
- `ajaxComplete` pour les requêtes AJAX
- Délais de 100ms pour la stabilité du DOM

### 🎨 Personnalisation

Les styles sont définis dans `modern.css` avec les variables CSS :
- `--ngWPAdminUI-modern-primary`
- `--ngWPAdminUI-modern-accent`
- `--ngWPAdminUI-modern-bg-primary`
- `--ngWPAdminUI-modern-border-color`
- `--ngWPAdminUI-modern-text-primary`
