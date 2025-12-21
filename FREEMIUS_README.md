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

Dans `better-interface.php`, modifier la fonction `ngBetterInterface_fs()` :

```php
$ngBetterInterface_fs = fs_dynamic_init(array(
    'id'                  => 'VOTRE_ID_FREEMIUS', // Remplacer
    'slug'                => 'better-interface',
    'premium_slug'        => 'better-interface-premium',
    'type'                => 'plugin',
    'public_key'          => 'pk_VOTRE_CLE_PUBLIQUE', // Remplacer
    'is_premium'          => true,
    'premium_suffix'      => 'Pro',
    'has_premium_version' => true,
    'has_paid_plans'      => true,
    'is_org_compliant'    => true,
    'menu'                => array(
        'slug'           => 'better-interface',
        'parent'         => array(
            'slug' => 'tools.php',
        ),
    ),
    'secret_key'          => 'sk_VOTRE_CLE_SECRETE', // Remplacer en production
));
```

## Utilisation

### Vérifier la licence :
```php
$ngBetterInterface = BetterInterface::get_instance();
$has_valid_license = $ngBetterInterface->ngBetterInterface_has_valid_license();
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
