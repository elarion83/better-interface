<?php
/**
 * Plugin Name: WP Admin UI
 * Plugin URI: https://wpadminui.com
 * Description: Modernize the WordPress admin interface with a modern and transformed design
 * Version: 1.1.4
 * Author: Nicolas Gruwe
 * Author URI: https://nicolasgruwe.fr
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-admin-ui
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
define('WPAUI_PLUGIN_VERSION', '1.1.4');
define('WPAUI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WPAUI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('WPAUI_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Classe principale du plugin WP Admin UI
 * Gère l'initialisation et la coordination des fonctionnalités
 */
class WPAdminUI {
    
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
        'default' => 'Classic',
        'modern' => 'Modern'
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
        $this->ngWPAdminUI_init_hooks();
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
    private function ngWPAdminUI_init_hooks() {
        // Hooks d'activation/désactivation
        register_activation_hook(__FILE__, [$this, 'ngWPAdminUI_activate']);
        register_deactivation_hook(__FILE__, [$this, 'ngWPAdminUI_deactivate']);
        
        // Hooks d'initialisation
        add_action('init', [$this, 'ngWPAdminUI_init']);
        add_action('admin_init', [$this, 'ngWPAdminUI_admin_init']);
        
        // Hooks pour l'interface admin
        add_action('admin_enqueue_scripts', [$this, 'ngWPAdminUI_enqueue_admin_assets']);
        add_action('admin_menu', [$this, 'ngWPAdminUI_add_admin_menu']);
        
        // Hooks AJAX
        add_action('wp_ajax_ngWPAdminUI_save_mode', [$this, 'ngWPAdminUI_save_design_mode']);
        add_action('wp_ajax_ngWPAdminUI_save_color_theme', [$this, 'ngWPAdminUI_save_color_theme']);
        add_action('wp_ajax_ngWPAdminUI_search_suggestions', [$this, 'ngWPAdminUI_get_search_suggestions']);
    }
    
    /**
     * Initialisation du plugin
     */
    public function ngWPAdminUI_init() {
        // Chargement des traductions
        load_plugin_textdomain('wp-admin-ui', false, dirname(WPAUI_PLUGIN_BASENAME) . '/languages');
        
        // Récupération du mode actuel
        $this->current_mode = get_option('ngWPAdminUI_design_mode', 'default');

        // Récupération du thème de couleurs actuel (pour le mode moderne)
        // Pourquoi: utilisé par la page d'admin pour afficher et manipuler les thèmes
        // Forcer "midnight" par défaut et toujours
        $saved_theme = get_option('ngWPAdminUI_color_theme', 'midnight');
        $this->current_color_theme = 'midnight'; // Toujours "midnight" pour l'instant
        if ($saved_theme !== 'midnight') {
            update_option('ngWPAdminUI_color_theme', 'midnight');
        }
    }
    
    /**
     * Initialisation spécifique à l'admin
     */
    public function ngWPAdminUI_admin_init() {
        // Vérification des permissions
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Enregistrement des paramètres
        register_setting('ngWPAdminUI_settings', 'ngWPAdminUI_design_mode');
        // Thème de couleurs du mode moderne
        register_setting('ngWPAdminUI_settings', 'ngWPAdminUI_color_theme');
    }
    
    /**
     * Activation du plugin
     */
    public function ngWPAdminUI_activate() {
        // Création des options par défaut
        if (!get_option('ngWPAdminUI_design_mode')) {
            add_option('ngWPAdminUI_design_mode', 'default');
        }
        if (!get_option('ngWPAdminUI_color_theme')) {
            add_option('ngWPAdminUI_color_theme', 'midnight');
        } else {
            // Forcer "midnight" même si une autre valeur existe
            update_option('ngWPAdminUI_color_theme', 'midnight');
        }
        
        // Flush des règles de réécriture
        flush_rewrite_rules();
    }
    
    /**
     * Désactivation du plugin
     */
    public function ngWPAdminUI_deactivate() {
        // Nettoyage des options (optionnel - commenté pour préserver les données)
        // delete_option('ngWPAdminUI_design_mode');
        
        flush_rewrite_rules();
    }
    
    // Création de répertoires retirée: aucun usage dans la version actuelle
    
    /**
     * Ajout du menu d'administration
     */
    public function ngWPAdminUI_add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('WP Admin UI', 'wp-admin-ui'),
            __('WP Admin UI', 'wp-admin-ui'),
            'manage_options',
            'wp-admin-ui',
            [$this, 'ngWPAdminUI_admin_page']
        );
    }
    
    /**
     * Page d'administration du plugin
     */
    public function ngWPAdminUI_admin_page() {
        include WPAUI_PLUGIN_PATH . 'admin/admin-page.php';
    }
    
    /**
     * Chargement des assets admin
     */
    public function ngWPAdminUI_enqueue_admin_assets($hook) {
        // Chargement uniquement sur les pages admin
        if (!is_admin()) {
            return;
        }
        
        // Styles principaux
        wp_enqueue_style(
            'wp-admin-ui-admin',
            WPAUI_PLUGIN_URL . 'assets/css/admin.css',
            [],
            WPAUI_PLUGIN_VERSION
        );
        
        
        // Charger le fichier de configuration centralisé (toujours chargé en premier)
        wp_enqueue_script(
            'wp-admin-ui-config',
            WPAUI_PLUGIN_URL . 'assets/js/config.js',
            ['jquery'],
            WPAUI_PLUGIN_VERSION,
            true
        );
        
        // Script de sélection de mode/thème - toujours chargé
        wp_enqueue_script(
            'wp-admin-ui-mode-selector',
            WPAUI_PLUGIN_URL . 'assets/js/mode-selector.js',
            ['jquery', 'wp-admin-ui-config'],
            WPAUI_PLUGIN_VERSION,
            true
        );
        
        // Localisation pour AJAX
		wp_localize_script('wp-admin-ui-mode-selector', 'ngWPAdminUI_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('ngWPAdminUI_nonce'),
            'current_mode' => $this->current_mode,
            'available_modes' => $this->available_modes,
			// Thèmes de couleurs pour l'affichage transformé
            'current_color_theme' => $this->current_color_theme,
            'available_color_themes' => $this->available_color_themes,
			// Traductions JavaScript
			'i18n' => [
				'please_select_items' => __('Please select at least one item to perform this action on.', 'wp-admin-ui'),
				'deselect_all' => __('Deselect all', 'wp-admin-ui'),
			],
		]);
        
        // Scripts spécifiques au mode moderne
        if ($this->current_mode === 'modern') {
            // Charger les modules de la barre d'actions flottante en premier
            wp_enqueue_script(
                'wp-admin-ui-selection-counter',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/SelectionCounter.js',
                ['jquery', 'wp-admin-ui-config'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-add-button',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/AddButton.js',
                ['jquery'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-action-buttons',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/ActionButtons.js',
                ['jquery'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-search-modal',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/SearchModal.js',
                ['jquery'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-filters-panel',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/FiltersPanel.js',
                ['jquery'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-pagination',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/Pagination.js',
                ['jquery', 'wp-admin-ui-config'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            wp_enqueue_script(
                'wp-admin-ui-notices-manager',
                WPAUI_PLUGIN_URL . 'assets/js/floating-action-bar/NoticesManager.js',
                ['jquery', 'wp-admin-ui-config'],
                WPAUI_PLUGIN_VERSION,
                true
            );
            
            // Charger le script principal après les modules
            wp_enqueue_script(
                'wp-admin-ui-admin',
                WPAUI_PLUGIN_URL . 'assets/js/admin.js',
                ['jquery', 'wp-admin-ui-config', 'wp-admin-ui-selection-counter', 'wp-admin-ui-add-button', 'wp-admin-ui-action-buttons', 'wp-admin-ui-search-modal', 'wp-admin-ui-filters-panel', 'wp-admin-ui-pagination', 'wp-admin-ui-notices-manager'],
                WPAUI_PLUGIN_VERSION,
                true
            );
        }
        
        // Styles spécifiques au mode
        $this->ngWPAdminUI_enqueue_mode_specific_assets();
    }
    
    /**
     * Chargement des assets spécifiques au mode
     */
    private function ngWPAdminUI_enqueue_mode_specific_assets() {
        $mode = $this->current_mode;
        
        if ($mode !== 'default') {
            wp_enqueue_style(
                "wp-admin-ui-{$mode}",
                WPAUI_PLUGIN_URL . "assets/css/modes/{$mode}.css",
                ['wp-admin-ui-admin'],
                WPAUI_PLUGIN_VERSION
            );

            // Si le mode est moderne, charger toujours le thème "midnight"
            if ($mode === 'modern') {
                $theme = 'midnight';
                wp_enqueue_style(
                    "wp-admin-ui-theme-{$theme}",
                    WPAUI_PLUGIN_URL . "assets/css/themes/{$theme}.css",
                    ["wp-admin-ui-{$mode}"],
                    WPAUI_PLUGIN_VERSION
                );
            }
            
            // Si le mode est moderne, charger les styles spécifiques aux plugins
            if ($mode === 'modern') {
                $this->ngWPAdminUI_enqueue_plugin_specific_styles();
            }
        }
    }
    
    /**
     * Chargement des styles et scripts spécifiques aux plugins en mode moderne
     */
    private function ngWPAdminUI_enqueue_plugin_specific_styles() {
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
            'wp-admin-ui-scrollbars',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/scrollbars.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Styles pour les notices modernes
        wp_enqueue_style(
            'wp-admin-ui-notices',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/notices.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );

        // Styles pour la barre flottante
        wp_enqueue_style(
            'wp-admin-ui-actionbar-logic',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/floatingActionBar.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );

        // Styles pour la logique des boutons modernes
        wp_enqueue_style(
            'wp-admin-ui-buttons-logic',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/buttonsLogic.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Styles pour Contact Form 7
        wp_enqueue_style(
            'wp-admin-ui-contact-form-7',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/contact-form-7.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Styles pour Elementor
        wp_enqueue_style(
            'wp-admin-ui-elementor',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/elementor.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Styles pour Woocommerce
        wp_enqueue_style(
            'wp-admin-ui-woocommerce',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/woocommerce.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Styles pour la page d'installation de plugins
        wp_enqueue_style(
            'wp-admin-ui-plugins',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/css/plugins/plugins.css',
            ['wp-admin-ui-modern'],
            WPAUI_PLUGIN_VERSION
        );
        
        // Scripts de configuration pour le mode moderne
        wp_enqueue_script(
            'wp-admin-ui-custom-actions',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/js/customActionsButtons.js',
            ['wp-admin-ui-admin'],
            WPAUI_PLUGIN_VERSION,
            false
        );
        
        // Script d'application automatique des styles modernes
        wp_enqueue_script(
            'wp-admin-ui-modern-styles',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/js/modernButtonStyles.js',
            ['wp-admin-ui-admin', 'wp-admin-ui-custom-actions'],
            WPAUI_PLUGIN_VERSION,
            false
        );
        
        // Script d'application des styles de formulaire modernes
        wp_enqueue_script(
            'wp-admin-ui-modern-form-styles',
            WPAUI_PLUGIN_URL . 'assets/css/modes/modern/js/modernFormStyles.js',
            ['wp-admin-ui-admin', 'wp-admin-ui-modern-styles'],
            WPAUI_PLUGIN_VERSION,
            false
        );
    }
    
    /**
     * Sauvegarde du mode de design (AJAX)
     */
    public function ngWPAdminUI_save_design_mode() {
        // Vérification de sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngWPAdminUI_nonce')) {
            wp_die(__('Security violation', 'wp-admin-ui'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'wp-admin-ui'));
        }
        
        $mode = sanitize_text_field($_POST['mode']);
        
        // Vérification que le mode est valide
        if (!array_key_exists($mode, $this->available_modes)) {
            wp_send_json_error(__('Invalid mode', 'wp-admin-ui'));
        }
        
        // Sauvegarde du mode sélectionné
        // Pourquoi: utiliser la variable $mode au lieu d'une valeur en dur pour permettre de basculer entre 'default' et 'modern'
        update_option('ngWPAdminUI_design_mode', $mode);
        
        wp_send_json_success([
            'message' => __('Mode saved successfully', 'wp-admin-ui'),
            'mode' => $mode
        ]);
    }
    
    // Méthode de réinitialisation retirée: la fonctionnalité n'est pas exposée dans l'UI
    
    /**
     * Sauvegarde du thème de couleur (AJAX)
     * Pourquoi: permet de changer dynamiquement la palette via variables CSS
     */
    public function ngWPAdminUI_save_color_theme() {
        // Sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngWPAdminUI_nonce')) {
            wp_die(__('Security violation', 'wp-admin-ui'));
        }
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'wp-admin-ui'));
        }

        $theme = sanitize_text_field($_POST['theme'] ?? '');

        if (!array_key_exists($theme, $this->available_color_themes)) {
            wp_send_json_error(['message' => __('Invalid color theme', 'wp-admin-ui')]);
        }

        update_option('ngWPAdminUI_color_theme', $theme);
        $this->current_color_theme = $theme;

        wp_send_json_success([
            'message' => __('Color theme saved', 'wp-admin-ui'),
            'theme' => $theme,
        ]);
    }
    
    /**
     * Récupère les suggestions de recherche pour le type de posts actuel (AJAX)
     * Utilise les mécanismes WordPress natifs pour une recherche optimisée
     */
    public function ngWPAdminUI_get_search_suggestions() {
        // Sécurité
        if (!wp_verify_nonce($_POST['nonce'], 'ngWPAdminUI_nonce')) {
            wp_die(__('Security violation', 'wp-admin-ui'));
        }
        // Vérifier les permissions selon le type de recherche
        // Pourquoi: les utilisateurs nécessitent la capacité 'list_users', les posts 'edit_posts'
        $post_type = sanitize_text_field($_POST['post_type'] ?? 'post');
        if ($post_type === 'user') {
            if (!current_user_can('list_users')) {
                wp_die(__('Insufficient permissions', 'wp-admin-ui'));
            }
        } else {
            if (!current_user_can('edit_posts')) {
                wp_die(__('Insufficient permissions', 'wp-admin-ui'));
            }
        }

        $query = sanitize_text_field($_POST['query'] ?? '');
        $post_type = sanitize_text_field($_POST['post_type'] ?? 'post');
        $limit = intval($_POST['limit'] ?? 10);

        if (empty($query) || strlen($query) < 2) {
            wp_send_json_success(['suggestions' => []]);
        }

        // Pour les utilisateurs, utiliser une approche différente
        if ($post_type === 'user') {
            // Recherche dans les utilisateurs
            // Pourquoi: utiliser get_users() pour rechercher dans les utilisateurs WordPress
            $users = get_users([
                'search' => '*' . esc_attr($query) . '*',
                'search_columns' => ['user_login', 'user_nicename', 'user_email', 'display_name'],
                'number' => $limit,
                'orderby' => 'display_name',
                'order' => 'ASC'
            ]);
            
            $suggestions = [];
            foreach ($users as $user) {
                $suggestions[] = [
                    'id' => $user->ID,
                    'title' => $user->display_name . ' (' . $user->user_login . ')',
                    'status' => 'active',
                    'date' => $user->user_registered,
                    'edit_url' => admin_url('user-edit.php?user_id=' . $user->ID),
                    'context' => $user->user_email,
                    'type' => 'user',
                    'role' => !empty($user->roles) ? implode(', ', $user->roles) : ''
                ];
            }
            
            wp_send_json_success([
                'suggestions' => $suggestions,
                'query' => $query,
                'post_type' => $post_type,
                'total' => count($suggestions)
            ]);
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
    public function ngWPAdminUI_get_current_mode() {
        return $this->current_mode;
    }
    
    /**
     * Obtient le thème de couleur actuel (mode moderne)
     */
    public function ngWPAdminUI_get_current_color_theme() {
        return $this->current_color_theme;
    }
    
    /**
     * Obtient les thèmes de couleur disponibles (mode moderne)
     */
    public function ngWPAdminUI_get_available_color_themes() {
        return $this->available_color_themes;
    }
    
    /**
     * Obtient les modes disponibles
     */
    public function ngWPAdminUI_get_available_modes() {
        return $this->available_modes;
    }

    /**
     * Vérifie si Freemius est disponible et configuré
     * En mode développement, retourne toujours true pour éviter les blocages
     */
    public function ngWPAdminUI_has_valid_license() {
        if (function_exists('ngWPAdminUI_fs')) {
            $fs = ngWPAdminUI_fs();
            if (is_object($fs)) {
                // En développement, on considère toujours valide
                // En production, utiliser : return $fs->is_registered() && $fs->is_paying_or_trial();
                return true; // Mode développement
            }
        }
        return false;
    }
}

// Initialisation du plugin
WPAdminUI::get_instance();

/**
 * Initialisation de Freemius
 * Configuration pour plugin SaaS avec 3 plans payants (différents nombres de licences)
 * 
 * IMPORTANT: Remplacer les valeurs ci-dessous par vos vraies clés depuis le dashboard Freemius
 * - ID produit : Dashboard Freemius > Votre produit > Settings > Product ID
 * - Clé publique : Dashboard Freemius > Votre produit > Settings > Public Key
 * - Clé secrète : Dashboard Freemius > Votre produit > Settings > Secret Key (pour production)
 */
if (file_exists(dirname(__FILE__) . '/includes/freemius/start.php')) {
    require_once dirname(__FILE__) . '/includes/freemius/start.php';

    if (function_exists('fs_dynamic_init')) {
        function ngWPAdminUI_fs() {
            global $ngWPAdminUI_fs;

            if (!isset($ngWPAdminUI_fs)) {
                // Configuration Freemius
                // Pourquoi: une seule version avec 3 plans payants (différents nombres de licences)
                $ngWPAdminUI_fs = fs_dynamic_init(array(
                    // ID produit Freemius (à remplacer par votre ID réel)
                    'id'                  => '22549',
                    
                    // Slug du plugin (doit correspondre au dossier du plugin)
                    'slug'                => 'wp-admin-ui',
                    
                    // Type de produit
                    'type'                => 'plugin',
                    
                    // Clé publique Freemius (à remplacer par votre clé publique réelle)
                    'public_key'          => 'pk_3c89decc7c6694d774ed81e1ca7ab',
                    
                    // Une seule version (pas de freemium)
                    'is_premium'          => true,
                    'has_premium_version' => false,
                    'has_paid_plans'      => true,
                    
                    // Conformité WordPress.org (false car plugin premium uniquement)
                    'is_org_compliant'    => false,
                    
                    // Menu d'administration
                    'menu'                => array(
                        'slug'           => 'wp-admin-ui',
                        'parent'         => array(
                            'slug' => 'tools.php',
                        ),
                    ),
                    
                    // Clé secrète (null en dev, à remplacer par votre clé secrète en production)
                    // Pourquoi: la clé secrète est nécessaire pour les opérations sensibles
                    'secret_key'          => null,
                ));
            }

            return $ngWPAdminUI_fs;
        }

        // Init Freemius
        // Pourquoi: initialiser le SDK après la définition de la fonction
        ngWPAdminUI_fs();
        
        // Signal que le SDK a été initialisé
        do_action('ngWPAdminUI_fs_loaded');
    }
} 