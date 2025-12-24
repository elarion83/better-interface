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
$ngWPAdminUI = WPAdminUI::get_instance();
$is_transformed = $ngWPAdminUI->ngWPAdminUI_get_current_mode() === 'modern';
$has_valid_license = $ngWPAdminUI->ngWPAdminUI_has_valid_license();
$custom_css = get_option('bi_custom_css', '');
$custom_js = get_option('bi_custom_js', '');
?>

<div class="wrap ngWPAdminUI-admin-page">
	<div class="ngWPAdminUI-header">
		<h1 class="ngWPAdminUI-title">
            <span class="dashicons dashicons-admin-appearance"></span>
            <?php _e('WP Admin UI', 'wp-admin-ui'); ?>
        </h1>
        <p class="ngWPAdminUI-description">
            <?php _e('Modernisez votre interface administrateur WordPress avec un design transformé.', 'wp-admin-ui'); ?>
        </p>
    </div>

    <div class="ngWPAdminUI-content">
        <!-- Section de l'affichage transformé -->
        <div class="ngWPAdminUI-section">
            <h2><?php _e('Affichage Transformé', 'wp-admin-ui'); ?></h2>
            <p><?php _e('Activez ou désactivez l\'affichage transformé de votre interface administrateur :', 'wp-admin-ui'); ?></p>
            
            <div class="ngWPAdminUI-toggle-section">
                <div class="ngWPAdminUI-toggle-card <?php echo $is_transformed ? 'active' : ''; ?>" data-transformed="<?php echo $is_transformed ? '1' : '0'; ?>">
                    <div class="ngWPAdminUI-toggle-preview">
                        <div class="ngWPAdminUI-preview-header">
                            <div class="ngWPAdminUI-preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div class="ngWPAdminUI-preview-content">
                            <div class="ngWPAdminUI-preview-sidebar"></div>
                            <div class="ngWPAdminUI-preview-main">
                                <div class="ngWPAdminUI-preview-bar"></div>
                                <div class="ngWPAdminUI-preview-content-area"></div>
                            </div>
                        </div>
                    </div>
                    <div class="ngWPAdminUI-toggle-info">
                        <div class="ngWPAdminUI-toggle-switch">
                            <label class="ngWPAdminUI-switch">
                                <input type="checkbox" id="ngWPAdminUI-transformed-toggle" <?php echo $is_transformed ? 'checked' : ''; ?>>
                                <span class="ngWPAdminUI-slider"></span>
                            </label>
                        </div>
                        <div class="ngWPAdminUI-toggle-text">
                            <h3><?php echo $is_transformed ? __('Activé', 'wp-admin-ui') : __('Désactivé', 'wp-admin-ui'); ?></h3>
                            <p class="ngWPAdminUI-toggle-description">
                                <?php echo $is_transformed 
                                    ? __('Interface moderne avec des couleurs vives et des animations fluides.', 'wp-admin-ui')
                                    : __('Interface classique WordPress avec des améliorations subtiles.', 'wp-admin-ui'); ?>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ngWPAdminUI-toggle-actions">
                <button type="button" class="button button-primary ngWPAdminUI-save-toggle" disabled>
                    <?php _e('Appliquer les changements', 'wp-admin-ui'); ?>
                </button>
            </div>
        </div>


        <!-- Section informations -->
        <div class="ngWPAdminUI-section">
            <h2><?php _e('Informations', 'wp-admin-ui'); ?></h2>
            
            <div class="ngWPAdminUI-info-grid">
                <div class="ngWPAdminUI-info-card">
                    <h3><?php _e('Affichage Transformé', 'wp-admin-ui'); ?></h3>
                    <p class="ngWPAdminUI-info-value"><?php echo $is_transformed ? __('Activé', 'wp-admin-ui') : __('Désactivé', 'wp-admin-ui'); ?></p>
                </div>

                <div class="ngWPAdminUI-info-card">
                    <h3><?php _e('Licence', 'wp-admin-ui'); ?></h3>
                    <p class="ngWPAdminUI-info-value">
                        <?php if (function_exists('ngWPAdminUI_fs')): ?>
                            <?php if ($has_valid_license): ?>
                                <span style="color: #10b981;"><?php _e('Activée', 'wp-admin-ui'); ?></span>
                            <?php else: ?>
                                <span style="color: #ef4444;"><?php _e('Non activée', 'wp-admin-ui'); ?></span>
                            <?php endif; ?>
                        <?php else: ?>
                            <span style="color: #f59e0b;"><?php _e('SDK non configuré', 'wp-admin-ui'); ?></span>
                        <?php endif; ?>
                    </p>
                </div>

                <div class="ngWPAdminUI-info-card">
                    <h3><?php _e('Version', 'wp-admin-ui'); ?></h3>
                    <p class="ngWPAdminUI-info-value"><?php echo BI_PLUGIN_VERSION; ?></p>
                </div>

                <div class="ngWPAdminUI-info-card">
                    <h3><?php _e('Compatibilité', 'wp-admin-ui'); ?></h3>
                    <p class="ngWPAdminUI-info-value">WordPress 5.0+</p>
                </div>
            </div>
            
            <div class="ngWPAdminUI-actions">
                <button type="button" class="button ngWPAdminUI-reset-all">
                    <?php _e('Réinitialiser tous les paramètres', 'wp-admin-ui'); ?>
                </button> 
            </div>
        </div>
    </div>
</div>

<!-- Notifications -->
<div id="ngWPAdminUI-notifications" class="ngWPAdminUI-notifications"></div> 
