<?php
/**
 * Page d'administration du plugin WP Modern UI
 * Interface moderne pour la gestion de l'affichage transformé
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Récupération de l'instance du plugin
$ngBetterInterface = BetterInterface::get_instance();
$is_transformed = $ngBetterInterface->ngBetterInterface_get_current_mode() === 'modern';
$current_color_theme = $ngBetterInterface->ngBetterInterface_get_current_color_theme();
$available_color_themes = $ngBetterInterface->ngBetterInterface_get_available_color_themes();
$custom_css = get_option('bi_custom_css', '');
$custom_js = get_option('bi_custom_js', '');
?>

<div class="wrap ngBetterInterface-admin-page">
	<div class="ngBetterInterface-header">
		<h1 class="ngBetterInterface-title">
            <span class="dashicons dashicons-admin-appearance"></span>
            <?php _e('WP Modern UI', 'better-interface'); ?>
        </h1>
        <p class="ngBetterInterface-description">
            <?php _e('Modernisez votre interface administrateur WordPress avec un design transformé.', 'better-interface'); ?>
        </p>
    </div>

    <div class="ngBetterInterface-content">
        <!-- Section de l'affichage transformé -->
        <div class="ngBetterInterface-section">
            <h2><?php _e('Affichage Transformé', 'better-interface'); ?></h2>
            <p><?php _e('Activez ou désactivez l\'affichage transformé de votre interface administrateur :', 'better-interface'); ?></p>
            
            <div class="ngBetterInterface-toggle-section">
                <div class="ngBetterInterface-toggle-card <?php echo $is_transformed ? 'active' : ''; ?>" data-transformed="<?php echo $is_transformed ? '1' : '0'; ?>">
                    <div class="ngBetterInterface-toggle-preview">
                        <div class="ngBetterInterface-preview-header">
                            <div class="ngBetterInterface-preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div class="ngBetterInterface-preview-content">
                            <div class="ngBetterInterface-preview-sidebar"></div>
                            <div class="ngBetterInterface-preview-main">
                                <div class="ngBetterInterface-preview-bar"></div>
                                <div class="ngBetterInterface-preview-content-area"></div>
                            </div>
                        </div>
                    </div>
                    <div class="ngBetterInterface-toggle-info">
                        <div class="ngBetterInterface-toggle-switch">
                            <label class="ngBetterInterface-switch">
                                <input type="checkbox" id="ngBetterInterface-transformed-toggle" <?php echo $is_transformed ? 'checked' : ''; ?>>
                                <span class="ngBetterInterface-slider"></span>
                            </label>
                        </div>
                        <div class="ngBetterInterface-toggle-text">
                            <h3><?php echo $is_transformed ? __('Activé', 'better-interface') : __('Désactivé', 'better-interface'); ?></h3>
                            <p class="ngBetterInterface-toggle-description">
                                <?php echo $is_transformed 
                                    ? __('Interface moderne avec des couleurs vives et des animations fluides.', 'better-interface')
                                    : __('Interface classique WordPress avec des améliorations subtiles.', 'better-interface'); ?>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ngBetterInterface-toggle-actions">
                <button type="button" class="button button-primary ngBetterInterface-save-toggle" disabled>
                    <?php _e('Appliquer les changements', 'better-interface'); ?>
                </button>
            </div>
        </div>

        <!-- Section des thèmes de couleurs (uniquement si l'affichage transformé est activé) -->
        <?php if ($is_transformed) : ?>
        <div class="ngBetterInterface-section">
            <h2><?php _e('Thèmes de Couleurs', 'better-interface'); ?></h2>
            <p><?php _e('Personnalisez l\'apparence de votre interface avec nos thèmes de couleurs modernes :', 'better-interface'); ?></p>
            
            <div class="ngBetterInterface-themes-grid">
                <?php foreach ($available_color_themes as $theme_key => $theme_name) : ?>
                    <div class="ngBetterInterface-theme-card <?php echo ($current_color_theme === $theme_key) ? 'active' : ''; ?>" data-theme="<?php echo esc_attr($theme_key); ?>">
                        <div class="ngBetterInterface-theme-preview">
                            <div class="ngBetterInterface-theme-colors">
                                <div class="ngBetterInterface-color-primary" style="background: var(--ngBetterInterface-<?php echo esc_attr($theme_key); ?>-primary);"></div>
                                <div class="ngBetterInterface-color-accent" style="background: var(--ngBetterInterface-<?php echo esc_attr($theme_key); ?>-accent);"></div>
                                <div class="ngBetterInterface-color-secondary" style="background: var(--ngBetterInterface-<?php echo esc_attr($theme_key); ?>-secondary);"></div>
                            </div>
                            <div class="ngBetterInterface-theme-preview-ui">
                                <div class="ngBetterInterface-preview-header-mini"></div>
                                <div class="ngBetterInterface-preview-sidebar-mini"></div>
                                <div class="ngBetterInterface-preview-content-mini"></div>
                            </div>
                        </div>
                        <div class="ngBetterInterface-theme-info">
                            <h3><?php echo esc_html($theme_name); ?></h3>
                            <p class="ngBetterInterface-theme-description">
                                <?php
                                switch ($theme_key) {
                                    case 'ocean': _e('Bleu océan moderne et apaisant.', 'better-interface'); break;
                                    case 'midnight': _e('Noir minuit sobre et professionnel.', 'better-interface'); break;
                                    case 'teal': _e('Turquoise élégant et sophistiqué.', 'better-interface'); break;
                                }
                                ?>
                            </p>
                            <?php if ($current_color_theme === $theme_key) : ?>
                                <span class="ngBetterInterface-current-badge"><?php _e('Actuel', 'better-interface'); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="ngBetterInterface-theme-actions">
                <button type="button" class="button button-primary ngBetterInterface-save-theme" disabled>
                    <?php _e('Appliquer le thème sélectionné', 'better-interface'); ?>
                </button>
            </div>
        </div>
        <?php endif; ?>

        <!-- Section informations -->
        <div class="ngBetterInterface-section">
            <h2><?php _e('Informations', 'better-interface'); ?></h2>
            
            <div class="ngBetterInterface-info-grid">
                <div class="ngBetterInterface-info-card">
                    <h3><?php _e('Affichage Transformé', 'better-interface'); ?></h3>
                    <p class="ngBetterInterface-info-value"><?php echo $is_transformed ? __('Activé', 'better-interface') : __('Désactivé', 'better-interface'); ?></p>
                </div>
                
                <div class="ngBetterInterface-info-card">
                    <h3><?php _e('Version', 'better-interface'); ?></h3>
                    <p class="ngBetterInterface-info-value"><?php echo BI_PLUGIN_VERSION; ?></p>
                </div>
                
                <div class="ngBetterInterface-info-card">
                    <h3><?php _e('Compatibilité', 'better-interface'); ?></h3>
                    <p class="ngBetterInterface-info-value">WordPress 5.0+</p>
                </div>
            </div>
            
            <div class="ngBetterInterface-actions">
                <button type="button" class="button ngBetterInterface-reset-all">
                    <?php _e('Réinitialiser tous les paramètres', 'better-interface'); ?>
                </button>
                <a href="https://github.com/elarion83/better-interface" target="_blank" class="button">
                    <?php _e('Documentation', 'better-interface'); ?>
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Notifications -->
<div id="ngBetterInterface-notifications" class="ngBetterInterface-notifications"></div> 
