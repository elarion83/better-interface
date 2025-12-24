# Intégration Freemius SDK

## Installation

1. **Télécharger le SDK Freemius :**
   ```bash
   cd includes/freemius
   git clone https://github.com/Freemius/wordpress-sdk.git .
   ```

2. **Configurer les clés Freemius :**
   - Remplacer `'id'` par votre ID produit Freemius
   - Remplacer `'public_key'` par votre clé publique Freemius
   - Remplacer `'secret_key'` par votre clé secrète Freemius (en production uniquement)

## Configuration

### Mode Développement (actuel)

Le plugin est configuré en mode développement avec des paramètres temporaires. La licence est toujours considérée comme valide pour permettre les tests.

### Configuration Production

Pour passer en production, modifier dans `wp-admin-ui.php` la fonction `ngBetterInterface_fs()` :

```php
$ngBetterInterface_fs = fs_dynamic_init(array(
    'id'                  => 'VOTRE_ID_FREEMIUS', // Remplacer par votre ID réel
    'slug'                => 'wp-admin-ui',
    'premium_slug'        => 'wp-admin-ui-premium',
    'type'                => 'plugin',
    'public_key'          => 'pk_VOTRE_CLE_PUBLIQUE', // Remplacer par votre clé publique
    'is_premium'          => true,
    'premium_suffix'      => 'Pro',
    'has_premium_version' => true,
    'has_paid_plans'      => true,
    'is_org_compliant'    => true,
    'menu'                => array(
        'slug'           => 'wp-admin-ui',
        'parent'         => array(
            'slug' => 'tools.php',
        ),
    ),
    'secret_key'          => 'sk_VOTRE_CLE_SECRETE', // Remplacer en production
));
```

Et modifier la méthode `ngBetterInterface_has_valid_license()` :

```php
public function ngBetterInterface_has_valid_license() {
    if (function_exists('ngBetterInterface_fs')) {
        $fs = ngBetterInterface_fs();
        if (is_object($fs)) {
            return $fs->is_registered() && $fs->is_paying_or_trial(); // Vérification réelle
        }
    }
    return false;
}
```

## Utilisation

### Vérifier la licence :
```php
$ngWPAdminUI = WPAdminUI::get_instance();
$has_valid_license = $ngWPAdminUI->ngBetterInterface_has_valid_license();
```

### Méthodes Freemius disponibles :
```php
// Vérifier si l'utilisateur est enregistré
ngBetterInterface_fs()->is_registered()

// Vérifier si l'utilisateur paye ou est en essai
ngBetterInterface_fs()->is_paying_or_trial()

// Obtenir l'URL de mise à niveau
ngBetterInterface_fs()->get_upgrade_url()

// Obtenir l'URL du compte
ngBetterInterface_fs()->get_account_url()
```

## Développement

- Le SDK est en mode développement avec une clé temporaire
- Les fichiers Freemius sont ignorés par Git (.gitignore)
- En production, remplacer la `secret_key` par votre vraie clé

## Documentation

Voir la documentation complète : https://github.com/Freemius/wordpress-sdk
