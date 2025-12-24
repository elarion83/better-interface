# Guide des Icônes Material Icons pour les Boutons Personnalisés

## 🎯 **Icônes Recommandées par Action :**

### ✅ **Actions de Base :**
- **Edit/Modifier** : `edit`, `edit_note`, `mode_edit`
- **Delete/Supprimer** : `delete`, `delete_forever`, `delete_outline`
- **Update/Mettre à jour** : `update`, `refresh`, `sync`
- **View/Voir** : `visibility`, `visibility_off`, `preview`

### ✅ **Actions de Modération :**
- **Approve/Approuver** : `thumb_up`, `check_circle`, `verified`
- **Unapprove/Désapprouver** : `thumb_down`, `cancel`, `block`
- **Spam** : `report`, `warning`, `error`
- **Unspam** : `undo`, `restore`, `restore_from_trash`

### ✅ **Actions de Plugins :**
- **Activate/Activer** : `power`, `power_settings_new`, `toggle_on`
- **Deactivate/Désactiver** : `power_off`, `toggle_off`, `block`
- **Auto-update** : `auto_awesome`, `auto_fix_high`, `schedule`

### ✅ **Actions Utilisateur :**
- **Reset Password** : `lock_reset`, `vpn_key`, `key`
- **Move to Trash** : `delete`, `delete_outline`, `restore_from_trash`
- **Untrash** : `restore`, `undo`, `restore_from_trash`

## 🔧 **Utilisation dans le Code :**

```javascript
// Dans customActionsButtons.js
{
    buttonClass: 'ngWPAdminUI-edit-button',
    title: 'Edit',
    icon: '<span class="material-icons">edit</span>',
    backgroundColor: '#3b82f6',
    hoverBackgroundColor: '#2563eb'
}
```

## 📋 **Icônes Populaires :**

### **Navigation :**
- `first_page`, `last_page`, `navigate_before`, `navigate_next`
- `skip_previous`, `skip_next`, `fast_rewind`, `fast_forward`

### **Filtres et Recherche :**
- `filter_list`, `search`, `tune`, `sort`
- `filter_alt`, `filter_alt_off`, `clear_all`

### **Statuts :**
- `check_circle`, `error`, `warning`, `info`
- `success`, `pending`, `schedule`, `done`

### **Actions Avancées :**
- `settings`, `more_vert`, `more_horiz`, `menu`
- `download`, `upload`, `share`, `link`

## 🎨 **Exemples Complets :**

```javascript
// Exemple de configuration complète
var ngBetterInterfaceCustomActions = {
    'edit': {
        buttonClass: 'ngWPAdminUI-edit-button',
        title: 'Edit Selected',
        icon: '<span class="material-icons">edit</span>',
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#2563eb'
    },
    'delete': {
        buttonClass: 'ngWPAdminUI-delete-button',
        title: 'Delete Selected',
        icon: '<span class="material-icons">delete</span>',
        backgroundColor: '#ef4444',
        hoverBackgroundColor: '#dc2626'
    },
    'approve': {
        buttonClass: 'ngWPAdminUI-approve-button',
        title: 'Approve Selected',
        icon: '<span class="material-icons">thumb_up</span>',
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#059669'
    }
};
```

## 🌐 **Référence Complète :**
- **Site officiel** : https://fonts.google.com/icons
- **Recherche** : https://fonts.google.com/icons?selected=Material+Icons
- **Documentation** : https://developers.google.com/fonts/docs/material_icons

## 💡 **Conseils :**
1. **Cohérence** : Utilisez des icônes du même style pour des actions similaires
2. **Lisibilité** : Privilégiez les icônes simples et reconnaissables
3. **Couleurs** : Adaptez les couleurs à l'action (rouge pour supprimer, vert pour approuver, etc.)
4. **Accessibilité** : Gardez les titres descriptifs pour les lecteurs d'écran
