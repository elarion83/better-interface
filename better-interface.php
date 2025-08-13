<?php
/**
 * Plugin Name: Better Interface
 * Plugin URI: https://github.com/nicolasgruwe/better-interface
 * Description: Modernise l'interface administrateur WordPress avec 2 modes de design différents
 * Version: 1.0.0
 * Author: Nicolas Gruwe
 * Author URI: https://nicolasgruwe.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: better-interface
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Définition des constantes du plugin
define('BI_PLUGIN_VERSION', '1.0.0');
define('BI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('BI_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Classe principale du plugin Better Interface
 * Gère l'initialisation et la coordination des fonctionnalités
 */
class BetterInterface {
    
    /**
     * Instance unique de la classe (pattern Singleton)
     */
    private static $instance = null;
    
    /**
     * Mode de design actuel
     */
    private $current_mode = 'default';
    
    /**
     * Modes de design disponibles
     */
    private $available_modes = [
        'default' => 'Classique',
        'modern' => 'Moderne'
    ];
    
    /**
     * Constructeur privé (Singleton)
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Obtient l'instance unique de la classe
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Initialise les hooks WordPress
     */
    private function init_hooks() {
        // Hooks d'activation/désactivation
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        // Hooks d'initialisation
        add_action('init', [$this, 'init']);
        add_action('admin_init', [$this, 'admin_init']);
        
        // Hooks pour l'interface admin
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        
        // Hooks pour les styles et scripts
        add_action('admin_head', [$this, 'add_custom_styles']);
        add_action('admin_footer', [$this, 'add_custom_scripts']);
        
        // Hooks AJAX
        add_action('wp_ajax_bi_save_mode', [$this, 'save_design_mode']);
        add_action('wp_ajax_bi_reset_settings', [$this, 'reset_settings']);
        add_action('wp_ajax_bi_save_customizations', [$this, 'save_customizations']);
        add_action('wp_ajax_bi_preview_mode', [$this, 'preview_mode']);
    }
    
    /**
     * Initialisation du plugin
     */
    public function init() {
        // Chargement des traductions
        load_plugin_textdomain('better-interface', false, dirname(BI_PLUGIN_BASENAME) . '/languages');
        
        // Récupération du mode actuel
        $this->current_mode = get_option('bi_design_mode', 'default');

        // Si un ancien site avait le mode "minimal", on force un fallback vers "modern"
        // Pourquoi: le mode minimal est retiré du plugin et ne dispose plus de styles/assets.
        if ($this->current_mode === 'minimal') {
            $this->current_mode = 'modern';
            update_option('bi_design_mode', 'modern');
        }
    }
    
    /**
     * Initialisation spécifique à l'admin
     */
    public function admin_init() {
        // Vérification des permissions
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Enregistrement des paramètres
        register_setting('bi_settings', 'bi_design_mode');
        register_setting('bi_settings', 'bi_custom_css');
        register_setting('bi_settings', 'bi_custom_js');
    }
    
    /**
     * Activation du plugin
     */
    public function activate() {
        // Création des options par défaut
        if (!get_option('bi_design_mode')) {
            add_option('bi_design_mode', 'default');
        }
        
        // Création des répertoires nécessaires
        $this->create_directories();
        
        // Flush des règles de réécriture
        flush_rewrite_rules();
    }
    
    /**
     * Désactivation du plugin
     */
    public function deactivate() {
        // Nettoyage des options (optionnel - commenté pour préserver les données)
        // delete_option('bi_design_mode');
        // delete_option('bi_custom_css');
        // delete_option('bi_custom_js');
        
        flush_rewrite_rules();
    }
    
    /**
     * Création des répertoires nécessaires
     */
    private function create_directories() {
        $upload_dir = wp_upload_dir();
        $bi_dir = $upload_dir['basedir'] . '/better-interface';
        
        if (!file_exists($bi_dir)) {
            wp_mkdir_p($bi_dir);
        }
    }
    
    /**
     * Ajout du menu d'administration
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Better Interface', 'better-interface'),
            __('Better Interface', 'better-interface'),
            'manage_options',
            'better-interface',
            [$this, 'admin_page'],
            'dashicons-admin-appearance',
            60
        );
    }
    
    /**
     * Page d'administration du plugin
     */
    public function admin_page() {
        include BI_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    /**
     * Chargement des assets admin
     */
    public function enqueue_admin_assets($hook) {
        // Chargement uniquement sur les pages admin
        if (!is_admin()) {
            return;
        }
        
        // Styles principaux
        wp_enqueue_style(
            'better-interface-admin',
            BI_PLUGIN_URL . 'assets/css/admin.css',
            [],
            BI_PLUGIN_VERSION
        );
        
        // Scripts principaux
        wp_enqueue_script(
            'better-interface-admin',
            BI_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery'],
            BI_PLUGIN_VERSION,
            true
        );
        
        // Localisation pour AJAX
        wp_localize_script('better-interface-admin', 'bi_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('bi_nonce'),
            'current_mode' => $this->current_mode,
            'available_modes' => $this->available_modes
        ]);
        
        // Styles spécifiques au mode
        $this->enqueue_mode_specific_assets();
    }
    
    /**
     * Chargement des assets spécifiques au mode
     */
    private function enqueue_mode_specific_assets() {
        $mode = $this->current_mode;
        
        if ($mode !== 'default') {
            wp_enqueue_style(
                "better-interface-{$mode}",
                BI_PLUGIN_URL . "assets/css/modes/{$mode}.css",
                ['better-interface-admin'],
                BI_PLUGIN_VERSION
            );
        }
    }
    
    /**
     * Ajout des styles personnalisés
     */
    public function add_custom_styles() {
        $custom_css = get_option('bi_custom_css', '');
        if (!empty($custom_css)) {
            echo '<style id="better-interface-custom-css">' . $custom_css . '</style>';
        }
    }
    
    /**
     * Ajout des scripts personnalisés
     */
    public function add_custom_scripts() {
        $custom_js = get_option('bi_custom_js', '');
        if (!empty($custom_js)) {
            echo '<script id="better-interface-custom-js">' . $custom_js . '</script>';
        }
    }
    
    /**
     * Sauvegarde du mode de design (AJAX)
     */
    public function save_design_mode() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'bi_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }
        
        $mode = sanitize_text_field($_POST['mode']);
        
        // Vérification que le mode est valide
        if (!array_key_exists($mode, $this->available_modes)) {
            wp_send_json_error(__('Mode invalide', 'better-interface'));
        }
        
        // Sauvegarde
        update_option('bi_design_mode', $mode);
        
        wp_send_json_success([
            'message' => __('Mode sauvegardé avec succès', 'better-interface'),
            'mode' => $mode
        ]);
    }
    
    /**
     * Réinitialisation des paramètres (AJAX)
     */
    public function reset_settings() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'bi_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }
        
        // Réinitialisation
        update_option('bi_design_mode', 'default');
        update_option('bi_custom_css', '');
        update_option('bi_custom_js', '');
        
        wp_send_json_success(__('Paramètres réinitialisés', 'better-interface'));
    }
    
    /**
     * Sauvegarde des personnalisations (AJAX)
     */
    public function save_customizations() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'bi_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }
        
        $custom_css = sanitize_textarea_field($_POST['custom_css']);
        $custom_js = sanitize_textarea_field($_POST['custom_js']);
        
        // Validation basique du CSS et JS
        if (!empty($custom_css) && !$this->validate_css($custom_css)) {
            wp_send_json_error(__('CSS invalide détecté', 'better-interface'));
        }
        
        if (!empty($custom_js) && !$this->validate_js($custom_js)) {
            wp_send_json_error(__('JavaScript invalide détecté', 'better-interface'));
        }
        
        // Sauvegarde
        update_option('bi_custom_css', $custom_css);
        update_option('bi_custom_js', $custom_js);
        
        wp_send_json_success(__('Personnalisations sauvegardées avec succès', 'better-interface'));
    }
    
    /**
     * Aperçu du mode (AJAX)
     */
    public function preview_mode() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_GET['nonce'], 'bi_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }
        
        $mode = sanitize_text_field($_GET['mode']);
        
        // Vérification que le mode est valide
        if (!array_key_exists($mode, $this->available_modes)) {
            wp_die(__('Mode invalide', 'better-interface'));
        }
        
        // Stockage temporaire du mode pour l'aperçu
        set_transient('bi_preview_mode', $mode, 300); // 5 minutes
        
        // Redirection vers l'admin avec le mode d'aperçu
        wp_redirect(admin_url());
        exit;
    }
    
    /**
     * Validation basique du CSS
     */
    private function validate_css($css) {
        // Validation très basique - en production, utilisez une librairie dédiée
        return !preg_match('/<script|javascript:|vbscript:|onload=|onerror=/i', $css);
    }
    
    /**
     * Validation basique du JavaScript
     */
    private function validate_js($js) {
        // Validation très basique - en production, utilisez une librairie dédiée
        return !preg_match('/<script|javascript:|vbscript:|onload=|onerror=/i', $js);
    }
    
    /**
     * Obtient le mode actuel
     */
    public function get_current_mode() {
        return $this->current_mode;
    }
    
    /**
     * Obtient les modes disponibles
     */
    public function get_available_modes() {
        return $this->available_modes;
    }
}

// Initialisation du plugin
BetterInterface::get_instance(); 