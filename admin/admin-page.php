<?php
/**
 * Page d'administration du plugin Better Interface
 * Interface moderne pour la gestion des modes de design
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Récupération de l'instance du plugin
$bi = BetterInterface::get_instance();
$current_mode = $bi->get_current_mode();
$available_modes = $bi->get_available_modes();
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
            <?php _e('Modernisez votre interface administrateur WordPress avec nos 2 modes de design différents.', 'better-interface'); ?>
        </p>
    </div>

    <div class="bi-content">
        <!-- Section des modes de design -->
        <div class="bi-section">
            <h2><?php _e('Modes de Design', 'better-interface'); ?></h2>
            <p><?php _e('Sélectionnez le mode de design qui correspond le mieux à vos préférences :', 'better-interface'); ?></p>
            
            <div class="bi-modes-grid">
                <?php foreach ($available_modes as $mode_key => $mode_name) : ?>
                    <div class="bi-mode-card <?php echo ($current_mode === $mode_key) ? 'active' : ''; ?>" data-mode="<?php echo esc_attr($mode_key); ?>">
                        <div class="bi-mode-preview">
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
                        <div class="bi-mode-info">
                            <h3><?php echo esc_html($mode_name); ?></h3>
                            <p class="bi-mode-description">
                                <?php
                                switch ($mode_key) {
                                    case 'default':
                                        _e('Interface classique WordPress avec des améliorations subtiles.', 'better-interface');
                                        break;
                                    case 'modern':
                                        _e('Design moderne avec des couleurs vives et des animations fluides.', 'better-interface');
                                        break;
                                }
                                ?>
                            </p>
                            <?php if ($current_mode === $mode_key) : ?>
                                <span class="bi-current-badge"><?php _e('Actuel', 'better-interface'); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="bi-mode-actions">
                <button type="button" class="button button-primary bi-save-mode" disabled>
                    <?php _e('Appliquer le mode sélectionné', 'better-interface'); ?>
                </button>
                <button type="button" class="button bi-preview-mode">
                    <?php _e('Aperçu', 'better-interface'); ?>
                </button>
            </div>
        </div>

        <!-- Section des thèmes de couleurs (uniquement pour le mode moderne) -->
        <?php if ($current_mode === 'modern') : ?>
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
                                    case 'ocean':
                                        _e('Bleu océan moderne et apaisant.', 'better-interface');
                                        break;
                                    case 'forest':
                                        _e('Vert forêt naturel et reposant.', 'better-interface');
                                        break;
                                    case 'sunset':
                                        _e('Orange coucher de soleil chaleureux.', 'better-interface');
                                        break;
                                    case 'lavender':
                                        _e('Violet lavande élégant et sophistiqué.', 'better-interface');
                                        break;
                                    case 'midnight':
                                        _e('Noir minuit sobre et professionnel.', 'better-interface');
                                        break;
                                    case 'coral':
                                        _e('Coral moderne vibrant et énergique.', 'better-interface');
                                        break;
                                    case 'teal':
                                        _e('Turquoise élégant et sophistiqué.', 'better-interface');
                                        break;
                                    case 'amber':
                                        _e('Ambre doré chaleureux et accueillant.', 'better-interface');
                                        break;
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

        <!-- Section personnalisation avancée -->
        <div class="bi-section">
            <h2><?php _e('Personnalisation Avancée', 'better-interface'); ?></h2>
            <p><?php _e('Ajoutez vos propres styles CSS et scripts JavaScript pour personnaliser davantage l\'interface :', 'better-interface'); ?></p>
            
            <div class="bi-custom-tabs">
                <div class="bi-tabs-nav">
                    <button type="button" class="bi-tab-button active" data-tab="css">
                        <span class="dashicons dashicons-admin-appearance"></span>
                        <?php _e('CSS Personnalisé', 'better-interface'); ?>
                    </button>
                    <button type="button" class="bi-tab-button" data-tab="js">
                        <span class="dashicons dashicons-editor-code"></span>
                        <?php _e('JavaScript', 'better-interface'); ?>
                    </button>
                </div>
                
                <div class="bi-tabs-content">
                    <div class="bi-tab-content active" data-tab="css">
                        <div class="bi-editor-container">
                            <label for="bi-custom-css"><?php _e('CSS personnalisé :', 'better-interface'); ?></label>
                            <textarea id="bi-custom-css" name="bi_custom_css" rows="15" placeholder="/* Ajoutez vos styles CSS ici */"><?php echo esc_textarea($custom_css); ?></textarea>
                            <div class="bi-editor-info">
                                <p><?php _e('Exemple :', 'better-interface'); ?></p>
                                <code>#adminmenu { background: #2c3e50; }</code>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bi-tab-content" data-tab="js">
                        <div class="bi-editor-container">
                            <label for="bi-custom-js"><?php _e('JavaScript personnalisé :', 'better-interface'); ?></label>
                            <textarea id="bi-custom-js" name="bi_custom_js" rows="15" placeholder="// Ajoutez vos scripts JavaScript ici"><?php echo esc_textarea($custom_js); ?></textarea>
                            <div class="bi-editor-info">
                                <p><?php _e('Exemple :', 'better-interface'); ?></p>
                                <code>jQuery(document).ready(function($) { console.log('Better Interface loaded!'); });</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bi-custom-actions">
                <button type="button" class="button button-primary bi-save-custom">
                    <?php _e('Sauvegarder les personnalisations', 'better-interface'); ?>
                </button>
                <button type="button" class="button bi-reset-custom">
                    <?php _e('Réinitialiser', 'better-interface'); ?>
                </button>
            </div>
        </div>

        <!-- Section informations -->
        <div class="bi-section">
            <h2><?php _e('Informations', 'better-interface'); ?></h2>
            
            <div class="bi-info-grid">
                <div class="bi-info-card">
                    <h3><?php _e('Mode Actuel', 'better-interface'); ?></h3>
                    <p class="bi-info-value"><?php echo esc_html($available_modes[$current_mode]); ?></p>
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

<!-- Modal d'aperçu -->
<div id="bi-preview-modal" class="bi-modal">
    <div class="bi-modal-content">
        <div class="bi-modal-header">
            <h3><?php _e('Aperçu du Mode', 'better-interface'); ?></h3>
            <button type="button" class="bi-modal-close">&times;</button>
        </div>
        <div class="bi-modal-body">
            <div class="bi-preview-frame">
                <iframe id="bi-preview-iframe" src="<?php echo admin_url(); ?>"></iframe>
            </div>
        </div>
        <div class="bi-modal-footer">
            <button type="button" class="button bi-apply-preview">
                <?php _e('Appliquer ce mode', 'better-interface'); ?>
            </button>
            <button type="button" class="button bi-modal-close">
                <?php _e('Fermer', 'better-interface'); ?>
            </button>
        </div>
    </div>
</div>

<!-- Notifications -->
<div id="bi-notifications" class="bi-notifications"></div> 