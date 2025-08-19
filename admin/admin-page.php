<?php
/**
 * Page d'administration du plugin Better Interface
 * Interface moderne pour la gestion de l'affichage transformé
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Récupération de l'instance du plugin
$bi = BetterInterface::get_instance();
$is_transformed = $bi->get_current_mode() === 'modern';
$current_color_theme = $bi->get_current_color_theme();
$available_color_themes = $bi->get_available_color_themes();
$custom_css = get_option('bi_custom_css', '');
$custom_js = get_option('bi_custom_js', '');
?>

<div class="wrap bi-admin-page">
    <div class="bi-header">
        <h1 class="bi-title">
            <span class="dashicons dashicons-admin-appearance"></span>
            <?php _e('Better Interface', 'better-interface'); ?>
        </h1>
        <p class="bi-description">
            <?php _e('Modernisez votre interface administrateur WordPress avec un design transformé.', 'better-interface'); ?>
        </p>
    </div>

    <div class="bi-content">
        <!-- Section de l'affichage transformé -->
        <div class="bi-section">
            <h2><?php _e('Affichage Transformé', 'better-interface'); ?></h2>
            <p><?php _e('Activez ou désactivez l\'affichage transformé de votre interface administrateur :', 'better-interface'); ?></p>
            
            <div class="bi-toggle-section">
                <div class="bi-toggle-card <?php echo $is_transformed ? 'active' : ''; ?>" data-transformed="<?php echo $is_transformed ? '1' : '0'; ?>">
                    <div class="bi-toggle-preview">
                        <div class="bi-preview-header">
                            <div class="bi-preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div class="bi-preview-content">
                            <div class="bi-preview-sidebar"></div>
                            <div class="bi-preview-main">
                                <div class="bi-preview-bar"></div>
                                <div class="bi-preview-content-area"></div>
                            </div>
                        </div>
                    </div>
                    <div class="bi-toggle-info">
                        <div class="bi-toggle-switch">
                            <label class="bi-switch">
                                <input type="checkbox" id="bi-transformed-toggle" <?php echo $is_transformed ? 'checked' : ''; ?>>
                                <span class="bi-slider"></span>
                            </label>
                        </div>
                        <div class="bi-toggle-text">
                            <h3><?php echo $is_transformed ? __('Activé', 'better-interface') : __('Désactivé', 'better-interface'); ?></h3>
                            <p class="bi-toggle-description">
                                <?php echo $is_transformed 
                                    ? __('Interface moderne avec des couleurs vives et des animations fluides.', 'better-interface')
                                    : __('Interface classique WordPress avec des améliorations subtiles.', 'better-interface'); ?>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bi-toggle-actions">
                <button type="button" class="button button-primary bi-save-toggle" disabled>
                    <?php _e('Appliquer les changements', 'better-interface'); ?>
                </button>
            </div>
        </div>

        <!-- Section des thèmes de couleurs (uniquement si l'affichage transformé est activé) -->
        <?php if ($is_transformed) : ?>
        <div class="bi-section">
            <h2><?php _e('Thèmes de Couleurs', 'better-interface'); ?></h2>
            <p><?php _e('Personnalisez l\'apparence de votre interface avec nos thèmes de couleurs modernes :', 'better-interface'); ?></p>
            
            <div class="bi-themes-grid">
                <?php foreach ($available_color_themes as $theme_key => $theme_name) : ?>
                    <div class="bi-theme-card <?php echo ($current_color_theme === $theme_key) ? 'active' : ''; ?>" data-theme="<?php echo esc_attr($theme_key); ?>">
                        <div class="bi-theme-preview">
                            <div class="bi-theme-colors">
                                <div class="bi-color-primary" style="background: var(--bi-<?php echo esc_attr($theme_key); ?>-primary);"></div>
                                <div class="bi-color-accent" style="background: var(--bi-<?php echo esc_attr($theme_key); ?>-accent);"></div>
                                <div class="bi-color-secondary" style="background: var(--bi-<?php echo esc_attr($theme_key); ?>-secondary);"></div>
                            </div>
                            <div class="bi-theme-preview-ui">
                                <div class="bi-preview-header-mini"></div>
                                <div class="bi-preview-sidebar-mini"></div>
                                <div class="bi-preview-content-mini"></div>
                            </div>
                        </div>
                        <div class="bi-theme-info">
                            <h3><?php echo esc_html($theme_name); ?></h3>
                            <p class="bi-theme-description">
                                <?php
                                switch ($theme_key) {
                                    case 'ocean': _e('Bleu océan moderne et apaisant.', 'better-interface'); break;
                                    case 'midnight': _e('Noir minuit sobre et professionnel.', 'better-interface'); break;
                                    case 'teal': _e('Turquoise élégant et sophistiqué.', 'better-interface'); break;
                                    case 'minimal-contrast': _e('Clair, élégant et professionnel, inspiré de Notion et Tailwind UI.', 'better-interface'); break;
                                    case 'dark-pro': _e('Sombre, tech et reposant pour les yeux, idéal pour le mode nuit.', 'better-interface'); break;
                                    case 'warm-accent': _e('Plus créatif et vivant avec des accents chaleureux.', 'better-interface'); break;
                                }
                                ?>
                            </p>
                            <?php if ($current_color_theme === $theme_key) : ?>
                                <span class="bi-current-badge"><?php _e('Actuel', 'better-interface'); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="bi-theme-actions">
                <button type="button" class="button button-primary bi-save-theme" disabled>
                    <?php _e('Appliquer le thème sélectionné', 'better-interface'); ?>
                </button>
            </div>
        </div>
        <?php endif; ?>

        <!-- Section informations -->
        <div class="bi-section">
            <h2><?php _e('Informations', 'better-interface'); ?></h2>
            
            <div class="bi-info-grid">
                <div class="bi-info-card">
                    <h3><?php _e('Affichage Transformé', 'better-interface'); ?></h3>
                    <p class="bi-info-value"><?php echo $is_transformed ? __('Activé', 'better-interface') : __('Désactivé', 'better-interface'); ?></p>
                </div>
                
                <div class="bi-info-card">
                    <h3><?php _e('Version', 'better-interface'); ?></h3>
                    <p class="bi-info-value"><?php echo BI_PLUGIN_VERSION; ?></p>
                </div>
                
                <div class="bi-info-card">
                    <h3><?php _e('Compatibilité', 'better-interface'); ?></h3>
                    <p class="bi-info-value">WordPress 5.0+</p>
                </div>
            </div>
            
            <div class="bi-actions">
                <button type="button" class="button bi-reset-all">
                    <?php _e('Réinitialiser tous les paramètres', 'better-interface'); ?>
                </button>
                <a href="https://github.com/nicolasgruwe/better-interface" target="_blank" class="button">
                    <?php _e('Documentation', 'better-interface'); ?>
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Notifications -->
<div id="bi-notifications" class="bi-notifications"></div> 