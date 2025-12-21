<?php
/**
 * Plugin Name: Better Interface
 * Plugin URI: https://github.com/nicolasgruwe/better-interface
 * Description: Modernise l'interface administrateur WordPress avec 2 modes de design différents
 * Version: 1.1.1
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
define('BI_PLUGIN_VERSION', '1.1.1');
define('BI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('BI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('BI_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Inclusion du SDK Freemius
if ( file_exists( dirname( __FILE__ ) . '/includes/freemius/start.php' ) ) {
    require_once dirname( __FILE__ ) . '/includes/freemius/start.php';
}

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
    private $current_color_theme = 'midnight';

    /**
     * Thèmes de couleurs disponibles pour le mode moderne
     * Pourquoi: liste centralisée pour validation et UI
     */
    private $available_color_themes = [
        'ocean' => 'Ocean Blue',
        'midnight' => 'Midnight Dark',
        'teal' => 'Teal Elegant',
    ];
    
    /**
     * Constructeur privé (Singleton)
     */
    private function __construct() {
        $this->ngBetterInterface_init_hooks();
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
    private function ngBetterInterface_init_hooks() {
        // Hooks d'activation/désactivation
        register_activation_hook(__FILE__, [$this, 'ngBetterInterface_activate']);
        register_deactivation_hook(__FILE__, [$this, 'ngBetterInterface_deactivate']);
        
        // Hooks d'initialisation
        add_action('init', [$this, 'ngBetterInterface_init']);
        add_action('admin_init', [$this, 'ngBetterInterface_admin_init']);
        
        // Hooks pour l'interface admin
        add_action('admin_enqueue_scripts', [$this, 'ngBetterInterface_enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'ngBetterInterface_add_admin_menu']);
        
        // Hooks AJAX
        add_action('wp_ajax_ngBetterInterface_save_mode', [$this, 'ngBetterInterface_save_design_mode']);
        add_action('wp_ajax_ngBetterInterface_save_color_theme', [$this, 'ngBetterInterface_save_color_theme']);
        add_action('wp_ajax_ngBetterInterface_search_suggestions', [$this, 'ngBetterInterface_get_search_suggestions']);
    }
    
    /**
     * Initialisation du plugin
     */
    public function ngBetterInterface_init() {
        // Chargement des traductions
        load_plugin_textdomain('better-interface', false, dirname(BI_PLUGIN_BASENAME) . '/languages');
        
        // Récupération du mode actuel
        $this->current_mode = get_option('ngBetterInterface_design_mode', 'default');

        // Récupération du thème de couleurs actuel (pour le mode moderne)
        // Pourquoi: utilisé par la page d'admin pour afficher et manipuler les thèmes
        // Forcer "midnight" par défaut et toujours
        $saved_theme = get_option('ngBetterInterface_color_theme', 'midnight');
        $this->current_color_theme = 'midnight'; // Toujours "midnight" pour l'instant
        if ($saved_theme !== 'midnight') {
            update_option('ngBetterInterface_color_theme', 'midnight');
        }
    }
    
    /**
     * Initialisation spécifique à l'admin
     */
    public function ngBetterInterface_admin_init() {
        // Vérification des permissions
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Enregistrement des paramètres
        register_setting('ngBetterInterface_settings', 'ngBetterInterface_design_mode');
        // Thème de couleurs du mode moderne
        register_setting('ngBetterInterface_settings', 'ngBetterInterface_color_theme');
    }
    
    /**
     * Activation du plugin
     */
    public function ngBetterInterface_activate() {
        // Création des options par défaut
        if (!get_option('ngBetterInterface_design_mode')) {
            add_option('ngBetterInterface_design_mode', 'default');
        }
        if (!get_option('ngBetterInterface_color_theme')) {
            add_option('ngBetterInterface_color_theme', 'midnight');
        } else {
            // Forcer "midnight" même si une autre valeur existe
            update_option('ngBetterInterface_color_theme', 'midnight');
        }
        
        // Flush des règles de réécriture
        flush_rewrite_rules();
    }
    
    /**
     * Désactivation du plugin
     */
    public function ngBetterInterface_deactivate() {
        // Nettoyage des options (optionnel - commenté pour préserver les données)
        // delete_option('ngBetterInterface_design_mode');
        
        flush_rewrite_rules();
    }
    
    // Création de répertoires retirée: aucun usage dans la version actuelle
    
    /**
     * Ajout du menu d'administration
     */
    public function ngBetterInterface_add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('WP Modern UI', 'better-interface'),
            __('WP Modern UI', 'better-interface'),
            'manage_options',
            'better-interface',
            [$this, 'ngBetterInterface_admin_page']
        );
    }
    
    /**
     * Page d'administration du plugin
     */
    public function ngBetterInterface_admin_page() {
        include BI_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    /**
     * Chargement des assets admin
     */
    public function ngBetterInterface_enqueue_admin_assets($hook) {
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
        
        
        // Script de sélection de mode/thème - toujours chargé
        wp_enqueue_script(
            'better-interface-mode-selector',
            BI_PLUGIN_URL . 'assets/js/mode-selector.js',
            ['jquery'],
            BI_PLUGIN_VERSION,
            true
        );
        
        // Localisation pour AJAX
		wp_localize_script('better-interface-mode-selector', 'ngBetterInterface_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('ngBetterInterface_nonce'),
            'current_mode' => $this->current_mode,
            'available_modes' => $this->available_modes,
			// Thèmes de couleurs pour l'affichage transformé
            'current_color_theme' => $this->current_color_theme,
            'available_color_themes' => $this->available_color_themes,
			// Traductions JavaScript
			'i18n' => [
				'please_select_items' => __('Please select at least one item to perform this action on.', 'better-interface'),
				'deselect_all' => __('Désélectionner tout', 'better-interface'),
			],
		]);
        
        // Scripts spécifiques au mode moderne
        if ($this->current_mode === 'modern') {
            wp_enqueue_script(
                'better-interface-admin',
                BI_PLUGIN_URL . 'assets/js/admin.js',
                ['jquery'],
                BI_PLUGIN_VERSION,
                true
            );
        }
        
        // Styles spécifiques au mode
        $this->ngBetterInterface_enqueue_mode_specific_assets();
    }
    
    /**
     * Chargement des assets spécifiques au mode
     */
    private function ngBetterInterface_enqueue_mode_specific_assets() {
        $mode = $this->current_mode;
        
        if ($mode !== 'default') {
            wp_enqueue_style(
                "better-interface-{$mode}",
                BI_PLUGIN_URL . "assets/css/modes/{$mode}.css",
                ['better-interface-admin'],
                BI_PLUGIN_VERSION
            );

            // Si le mode est moderne, charger toujours le thème "midnight"
            if ($mode === 'modern') {
                $theme = 'midnight';
                wp_enqueue_style(
                    "better-interface-theme-{$theme}",
                    BI_PLUGIN_URL . "assets/css/themes/{$theme}.css",
                    ["better-interface-{$mode}"],
                    BI_PLUGIN_VERSION
                );
            }
            
            // Si le mode est moderne, charger les styles spécifiques aux plugins
            if ($mode === 'modern') {
                $this->ngBetterInterface_enqueue_plugin_specific_styles();
            }
        }
    }
    
    /**
     * Chargement des styles et scripts spécifiques aux plugins en mode moderne
     */
    private function ngBetterInterface_enqueue_plugin_specific_styles() {
        // Material Icons de Google pour le mode moderne
        wp_enqueue_style(
            'material-icons',
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            [],
            null
        );
        
        // Material Icons Outlined de Google pour le mode moderne
        wp_enqueue_style(
            'material-icons-outlined',
            'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined',
            [],
            null
        );
        
        // Styles pour les scrollbars modernes
        wp_enqueue_style(
            'better-interface-scrollbars',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/scrollbars.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Styles pour les notices modernes
        wp_enqueue_style(
            'better-interface-notices',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/notices.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );

        // Styles pour la barre flottante
        wp_enqueue_style(
            'better-interface-actionbar-logic',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/floatingActionBar.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );

        // Styles pour la logique des boutons modernes
        wp_enqueue_style(
            'better-interface-buttons-logic',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/buttonsLogic.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Styles pour Contact Form 7
        wp_enqueue_style(
            'better-interface-contact-form-7',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/contact-form-7.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Styles pour Elementor
        wp_enqueue_style(
            'better-interface-elementor',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/elementor.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Styles pour Woocommerce
        wp_enqueue_style(
            'better-interface-woocommerce',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/woocommerce.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Styles pour la page d'installation de plugins
        wp_enqueue_style(
            'better-interface-plugins',
            BI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/plugins.css',
            ['better-interface-modern'],
            BI_PLUGIN_VERSION
        );
        
        // Scripts de configuration pour le mode moderne
        wp_enqueue_script(
            'better-interface-custom-actions',
            BI_PLUGIN_URL . 'assets/css/modes/modern/js/customActionsButtons.js',
            ['better-interface-admin'],
            BI_PLUGIN_VERSION,
            false
        );
        
        // Script d'application automatique des styles modernes
        wp_enqueue_script(
            'better-interface-modern-styles',
            BI_PLUGIN_URL . 'assets/css/modes/modern/js/modernButtonStyles.js',
            ['better-interface-admin', 'better-interface-custom-actions'],
            BI_PLUGIN_VERSION,
            false
        );
        
        // Script d'application des styles de formulaire modernes
        wp_enqueue_script(
            'better-interface-modern-form-styles',
            BI_PLUGIN_URL . 'assets/css/modes/modern/js/modernFormStyles.js',
            ['better-interface-admin', 'better-interface-modern-styles'],
            BI_PLUGIN_VERSION,
            false
        );
    }
    
    /**
     * Sauvegarde du mode de design (AJAX)
     */
    public function ngBetterInterface_save_design_mode() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngBetterInterface_nonce')) {
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
        update_option('ngBetterInterface_design_mode', $mode);
        
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
    public function ngBetterInterface_save_color_theme() {
        // Sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngBetterInterface_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        if (!current_user_can('manage_options')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }

        $theme = sanitize_text_field($_POST['theme'] ?? '');

        if (!array_key_exists($theme, $this->available_color_themes)) {
            wp_send_json_error(['message' => __('Thème de couleur invalide', 'better-interface')]);
        }

        update_option('ngBetterInterface_color_theme', $theme);
        $this->current_color_theme = $theme;

        wp_send_json_success([
            'message' => __('Thème de couleur sauvegardé', 'better-interface'),
            'theme' => $theme,
        ]);
    }
    
    /**
     * Récupère les suggestions de recherche pour le type de posts actuel (AJAX)
     * Utilise les mécanismes WordPress natifs pour une recherche optimisée
     */
    public function ngBetterInterface_get_search_suggestions() {
        // Sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngBetterInterface_nonce')) {
            wp_die(__('Sécurité violée', 'better-interface'));
        }
        if (!current_user_can('edit_posts')) {
            wp_die(__('Permissions insuffisantes', 'better-interface'));
        }

        $query = sanitize_text_field($_POST['query'] ?? '');
        $post_type = sanitize_text_field($_POST['post_type'] ?? 'post');
        $limit = intval($_POST['limit'] ?? 10);

        if (empty($query) || strlen($query) < 2) {
            wp_send_json_success(['suggestions' => []]);
        }

        // Utiliser WP_Query pour récupérer les posts correspondants
        $args = [
            'post_type' => $post_type,
            'post_status' => ['publish', 'draft', 'private'],
            'posts_per_page' => $limit,
            's' => $query, // Recherche WordPress native
            'orderby' => 'relevance',
            'order' => 'DESC',
            'suppress_filters' => false, // Permettre aux plugins de modifier la requête
        ];

        // Pour les commentaires, utiliser une approche différente
        if ($post_type === 'comment') {
            // Recherche dans les commentaires
            $comments = get_comments([
                'search' => $query,
                'number' => $limit,
                'status' => 'all'
            ]);
            
            $suggestions = [];
            foreach ($comments as $comment) {
                $suggestions[] = [
                    'id' => $comment->comment_ID,
                    'title' => wp_trim_words($comment->comment_content, 10),
                    'status' => $comment->comment_approved,
                    'date' => $comment->comment_date,
                    'edit_url' => admin_url('comment.php?action=editcomment&c=' . $comment->comment_ID),
                    'context' => 'Commentaire sur: ' . get_the_title($comment->comment_post_ID),
                    'type' => 'comment'
                ];
            }
            
            wp_send_json_success([
                'suggestions' => $suggestions,
                'query' => $query,
                'post_type' => $post_type,
                'total' => count($suggestions)
            ]);
        }

        $search_query = new WP_Query($args);
        $suggestions = [];

        if ($search_query->have_posts()) {
            while ($search_query->have_posts()) {
                $search_query->the_post();
                $post_id = get_the_ID();
                $post_title = get_the_title();
                $post_status = get_post_status();
                $post_date = get_the_date('Y-m-d');
                
                // Récupérer l'URL d'édition
                $edit_url = get_edit_post_link($post_id);
                
                // Ajouter des informations contextuelles selon le type
                $context = '';
                if ($post_type === 'post') {
                    $categories = get_the_category();
                    if (!empty($categories)) {
                        $context = implode(', ', wp_list_pluck($categories, 'name'));
                    }
                } elseif ($post_type === 'page') {
                    $parent = get_post_parent();
                    if ($parent) {
                        $context = 'Enfant de: ' . get_the_title($parent);
                    }
                }

                $suggestions[] = [
                    'id' => $post_id,
                    'title' => $post_title,
                    'status' => $post_status,
                    'date' => $post_date,
                    'edit_url' => $edit_url,
                    'context' => $context,
                    'type' => $post_type
                ];
            }
            wp_reset_postdata();
        }

        // Si pas assez de résultats, essayer une recherche plus large
        if (count($suggestions) < $limit) {
            $fallback_args = [
                'post_type' => $post_type,
                'post_status' => ['publish', 'draft', 'private'],
                'posts_per_page' => $limit - count($suggestions),
                's' => $query,
                'orderby' => 'date',
                'order' => 'DESC',
                'suppress_filters' => false,
            ];

            $fallback_query = new WP_Query($fallback_args);
            if ($fallback_query->have_posts()) {
                while ($fallback_query->have_posts()) {
                    $fallback_query->the_post();
                    $post_id = get_the_ID();
                    
                    // Éviter les doublons
                    $exists = false;
                    foreach ($suggestions as $suggestion) {
                        if ($suggestion['id'] === $post_id) {
                            $exists = true;
                            break;
                        }
                    }
                    
                    if (!$exists) {
                        $suggestions[] = [
                            'id' => $post_id,
                            'title' => get_the_title(),
                            'status' => get_post_status(),
                            'date' => get_the_date('Y-m-d'),
                            'edit_url' => get_edit_post_link($post_id),
                            'context' => '',
                            'type' => $post_type
                        ];
                    }
                }
                wp_reset_postdata();
            }
        }

        wp_send_json_success([
            'suggestions' => $suggestions,
            'query' => $query,
            'post_type' => $post_type,
            'total' => count($suggestions),
            'debug' => [
                'found_posts' => $search_query->found_posts,
                'post_count' => $search_query->post_count,
                'args_used' => $args
            ]
        ]);
    }

    /**
     * Obtient le mode actuel
     */
    public function ngBetterInterface_get_current_mode() {
        return $this->current_mode;
    }
    
    /**
     * Obtient le thème de couleur actuel (mode moderne)
     */
    public function ngBetterInterface_get_current_color_theme() {
        return $this->current_color_theme;
    }
    
    /**
     * Obtient les thèmes de couleur disponibles (mode moderne)
     */
    public function ngBetterInterface_get_available_color_themes() {
        return $this->available_color_themes;
    }
    
    /**
     * Obtient les modes disponibles
     */
    public function ngBetterInterface_get_available_modes() {
        return $this->available_modes;
    }

    /**
     * Vérifie si Freemius est disponible et configuré
     */
    public function ngBetterInterface_has_valid_license() {
        if (function_exists('ngBetterInterface_fs') && ngBetterInterface_fs()->is_registered()) {
            return ngBetterInterface_fs()->is_paying_or_trial();
        }
        return false;
    }
}

// Initialisation du plugin
BetterInterface::get_instance();

/**
 * Initialisation de Freemius
 * Intégration simple pour vérification de licence
 */
if (function_exists('fs_dynamic_init')) {
    function ngBetterInterface_fs() {
        global $ngBetterInterface_fs;

        if (!isset($ngBetterInterface_fs)) {
            $ngBetterInterface_fs = fs_dynamic_init(array(
                'id'                  => '', // À remplacer par votre ID Freemius
                'slug'                => 'better-interface',
                'premium_slug'        => 'better-interface-premium',
                'type'                => 'plugin',
                'public_key'          => '', // À remplacer par votre clé publique Freemius
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
                // IMPORTANT: À remplacer par votre vraie clé secrète en production
                'secret_key'          => 'sk_test_placeholder_key_for_development_only',
            ));
        }

        return $ngBetterInterface_fs;
    }

    // Init Freemius.
    ngBetterInterface_fs();
    // Signal that SDK was initiated.
    do_action('ngBetterInterface_fs_loaded');
} 