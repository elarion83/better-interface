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
     * Thème de couleurs actuel pour le mode moderne
     * Pourquoi: permet de piloter les variables CSS et l’aperçu des thèmes
     */
    private $current_color_theme = 'ocean';

    /**
     * Thèmes de couleurs disponibles pour le mode moderne
     * Pourquoi: liste centralisée pour validation et UI
     */
    private $available_color_themes = [
        'ocean' => 'Ocean Blue',
        'forest' => 'Forest Green',
        'sunset' => 'Sunset Orange',
        'lavender' => 'Lavender Purple',
        'midnight' => 'Midnight Dark',
        'teal' => 'Teal Elegant',
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
        
        // Hooks AJAX
        add_action('wp_ajax_bi_save_mode', [$this, 'save_design_mode']);
        add_action('wp_ajax_bi_save_color_theme', [$this, 'save_color_theme']);
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

        // Récupération du thème de couleurs actuel (pour le mode moderne)
        // Pourquoi: utilisé par la page d’admin pour afficher et manipuler les thèmes
        $this->current_color_theme = get_option('bi_color_theme', 'ocean');
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
        // Thème de couleurs du mode moderne
        register_setting('bi_settings', 'bi_color_theme');
    }
    
    /**
     * Activation du plugin
     */
    public function activate() {
        // Création des options par défaut
        if (!get_option('bi_design_mode')) {
            add_option('bi_design_mode', 'default');
        }
        if (!get_option('bi_color_theme')) {
            add_option('bi_color_theme', 'ocean');
        }
        
        // Flush des règles de réécriture
        flush_rewrite_rules();
    }
    
    /**
     * Désactivation du plugin
     */
    public function deactivate() {
        // Nettoyage des options (optionnel - commenté pour préserver les données)
        // delete_option('bi_design_mode');
        
        flush_rewrite_rules();
    }
    
    // Création de répertoires retirée: aucun usage dans la version actuelle
    
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
        
        // Scripts principaux - uniquement en mode moderne
        if ($this->current_mode === 'modern') {
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
                'available_modes' => $this->available_modes,
                // Thèmes de couleurs pour le mode moderne
                'current_color_theme' => $this->current_color_theme,
                'available_color_themes' => $this->available_color_themes,
            ]);
        }
        
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

            // Si le mode est moderne, charger le CSS du thème choisi (sauf 'ocean' qui est par défaut dans modern.css)
            if ($mode === 'modern' && !empty($this->current_color_theme) && $this->current_color_theme !== 'ocean') {
                $theme = $this->current_color_theme;
                wp_enqueue_style(
                    "better-interface-theme-{$theme}",
                    BI_PLUGIN_URL . "assets/css/themes/{$theme}.css",
                    ["better-interface-{$mode}"],
                    BI_PLUGIN_VERSION
                );
            }
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
    
    // Méthode de réinitialisation retirée: la fonctionnalité n'est pas exposée dans l'UI
    
    /**
     * Sauvegarde du thème de couleur (AJAX)
     * Pourquoi: permet de changer dynamiquement la palette via variables CSS
     */
    public function save_color_theme() {
        // Sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'bi_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }

        $theme = sanitize_text_field($_POST['theme'] ?? '');

        if (!array_key_exists($theme, $this->available_color_themes)) {
            wp_send_json_error(['message' => __('Thème de couleur invalide', 'better-interface')]);
        }

        update_option('bi_color_theme', $theme);
        $this->current_color_theme = $theme;

        wp_send_json_success([
            'message' => __('Thème de couleur sauvegardé', 'better-interface'),
            'theme' => $theme,
        ]);
    }
    
    /**
     * Obtient le mode actuel
     */
    public function get_current_mode() {
        return $this->current_mode;
    }
    
    /**
     * Obtient le thème de couleur actuel (mode moderne)
     */
    public function get_current_color_theme() {
        return $this->current_color_theme;
    }
    
    /**
     * Obtient les thèmes de couleur disponibles (mode moderne)
     */
    public function get_available_color_themes() {
        return $this->available_color_themes;
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