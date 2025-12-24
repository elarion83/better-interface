/**
 * WP Admin UI - Configuration centralisée
 * 
 * Ce fichier centralise toutes les constantes, variables de configuration
 * et paramètres utilisés dans le plugin.
 * 
 * Pourquoi: centraliser la configuration pour faciliter la maintenance
 * et éviter la duplication de code.
 */

(function(window) {
	'use strict';

	/**
	 * Configuration principale du plugin WP Admin UI
	 * @namespace WPAdminUI.Config
	 */
	window.WPAdminUI = window.WPAdminUI || {};
	
	// Préfixe CSS et JavaScript pour toutes les classes et variables
	// Pourquoi: centraliser le préfixe pour éviter la duplication et faciliter les modifications
	var prfx = 'ngWPAdminUI';
	
	window.WPAdminUI.Config = {
		
		/**
		 * Sélecteurs CSS fréquemment utilisés
		 * Pourquoi: éviter la duplication et améliorer les performances
		 */
		selectors: {
			// Tables et listes
			listTable: '.wp-list-table',
			listTableBody: '.wp-list-table tbody',
			listTableRow: '.wp-list-table tbody tr',
			listTableCheckbox: '.wp-list-table tbody input[type="checkbox"]',
			listTableCheckboxChecked: '.wp-list-table tbody input[type="checkbox"]:checked',
			selectAll1: '#cb-select-all-1',
			selectAll2: '#cb-select-all-2',
			
			// Navigation
			tablenav: '.tablenav.top',
			pageTitle: 'h1.wp-heading-inline',
			displayingNum: '.displaying-num',
			
			// Barre flottante
			floatingBar: '.' + prfx + '-floating-action-bar',
			floatingActions: '.' + prfx + '-floating-actions',
			floatingLeft: '.' + prfx + '-floating-left',
			floatingRight: '.' + prfx + '-floating-right',
			selectionCounter: '.' + prfx + '-selection-counter',
			counterNumber: '.' + prfx + '-counter-number',
			counterText: '.' + prfx + '-counter-text',
			
			// Boutons
			addButton: '.' + prfx + '-add-button',
			searchButton: '.' + prfx + '-search-button',
			filtersButton: '.' + prfx + '-filters-button',
			deleteAllButton: '.' + prfx + '-delete-all-button',
			customButtons: '.' + prfx + '-trash-button, .' + prfx + '-edit-button, .' + prfx + '-update-button, .' + prfx + '-delete-all-button',
			
			// Modales et panels
			searchModal: '.' + prfx + '-search-modal',
			searchModalOpen: '.' + prfx + '-search-modal-open',
			filtersPanel: '.' + prfx + '-filters-panel',
			filtersPanelOpen: '.' + prfx + '-filters-panel-open',
			filtersPanelContent: '.' + prfx + '-filters-panel-content',
			filtersOverlay: '.' + prfx + '-filters-overlay',
			
			// Pagination
			modernPagination: '.' + prfx + '-modern-pagination',
			
			// Transitions et notices
			pageTransitionOverlay: '.' + prfx + '-page-transition-overlay',
			noticesContainer: '.' + prfx + '-notices-container',
			
			// Actions
			actions: '.' + prfx + '-floating-actions button, .' + prfx + '-floating-actions input[type="submit"], .' + prfx + '-floating-actions select',
			alwaysVisibleButtons: '[data-always-visible="true"]'
		},
		
		/**
		 * Classes CSS fréquemment utilisées
		 * Pourquoi: centraliser les noms de classes pour faciliter les modifications
		 */
		classes: {
			// États
			active: 'active',
			disabled: 'disabled',
			loading: 'loading',
			slideIn: 'slide-in',
			slideOut: 'slide-out',
			hasSelection: 'has-selection',
			fullWidth: prfx + '-full-width',
			rowSelected: prfx + '-row-selected',
			tableFullSelected: prfx + '-table-full-selected',
			counterChanging: 'counter-changing',
			
			// Modales
			searchModalOpen: prfx + '-search-modal-open',
			filtersPanelOpen: prfx + '-filters-panel-open',
			filtersOverlayOpen: prfx + '-filters-overlay-open',
			
			// Filtres
			filterActiveHighlight: prfx + '-filter-active-highlight'
		},
		
		/**
		 * Breakpoints responsive
		 * Pourquoi: centraliser les breakpoints pour cohérence
		 */
		breakpoints: {
			mobile: 768,
			tablet: 1024,
			desktop: 1280
		},
		
		/**
		 * Délais et timings (en millisecondes)
		 * Pourquoi: centraliser les délais pour faciliter les ajustements
		 */
		timings: {
			pageTransition: 300,
			counterAnimation: 50,
			searchDebounce: 300,
			resizeDebounce: 250
		},
		
		/**
		 * Configuration AJAX
		 * Pourquoi: centraliser les paramètres AJAX
		 */
		ajax: {
			actions: {
				saveMode: prfx + '_save_mode',
				saveColorTheme: prfx + '_save_color_theme',
				searchSuggestions: prfx + '_search_suggestions'
			},
			nonceName: prfx + '_nonce'
		},
		
		/**
		 * Messages et textes par défaut
		 * Pourquoi: centraliser les messages pour faciliter la traduction
		 */
		messages: {
			pleaseSelectItems: 'Please select at least one item to perform this action on.',
			deselectAll: 'Deselect all',
			confirmDeleteAll: 'Are you sure you want to delete all items? This action cannot be undone.',
			searching: 'Recherche en cours...',
			noResults: 'Aucun résultat trouvé pour',
			searchError: 'Erreur lors de la recherche'
		},
		
		/**
		 * Configuration des actions personnalisées
		 * Pourquoi: centraliser la référence aux actions personnalisées
		 */
		customActions: {
			windowKey: prfx + '_CustomActions',
			fallbackKey: 'ngBetterInterfaceCustomActions' // Pour compatibilité
		},
		
		/**
		 * Configuration de la recherche
		 * Pourquoi: centraliser les paramètres de recherche
		 */
		search: {
			minQueryLength: 2,
			maxSuggestions: 10,
			debounceDelay: 300
		},
		
		/**
		 * Configuration des transitions de page
		 * Pourquoi: centraliser les paramètres de transition
		 */
		pageTransition: {
			enabled: true,
			duration: 300,
			selectors: [
				'a[href*="admin.php"]',
				'a[href*="post.php"]',
				'a[href*="edit.php"]',
				'a[href*="upload.php"]',
				'a[href*="users.php"]',
				'a[href*="plugins.php"]',
				'a[href*="themes.php"]',
				'a[href*="options-general.php"]',
				'a[href*="tools.php"]',
				'a[href*="edit-comments.php"]'
			]
		},
		
		/**
		 * Configuration des notices
		 * Pourquoi: centraliser les paramètres des notices
		 */
		notices: {
			containerSelector: '.' + prfx + '-notices-container',
			excludedClasses: ['plugin-dependencies']
		}
	};
	
	/**
	 * Fonction utilitaire pour obtenir la configuration AJAX depuis WordPress
	 * Pourquoi: wrapper pour accéder aux données localisées de manière sécurisée
	 */
	WPAdminUI.Config.getAjaxData = function() {
		return window[prfx + '_ajax'] || {
			ajax_url: typeof ajaxurl !== 'undefined' ? ajaxurl : '',
			nonce: '',
			current_mode: 'default',
			available_modes: {},
			current_color_theme: 'midnight',
			available_color_themes: {},
			i18n: {}
		};
	};
	
	/**
	 * Fonction utilitaire pour obtenir les actions personnalisées
	 * Pourquoi: wrapper pour accéder aux actions personnalisées avec fallback
	 */
	WPAdminUI.Config.getCustomActions = function() {
		var config = WPAdminUI.Config.customActions;
		return window[config.windowKey] || window[config.fallbackKey] || {};
	};
	
	/**
	 * Fonction utilitaire pour obtenir un message traduit
	 * Pourquoi: centraliser l'accès aux messages traduits
	 */
	WPAdminUI.Config.getMessage = function(key) {
		var ajaxData = WPAdminUI.Config.getAjaxData();
		if (ajaxData.i18n && ajaxData.i18n[key]) {
			return ajaxData.i18n[key];
		}
		return WPAdminUI.Config.messages[key] || '';
	};
	
})(window);

