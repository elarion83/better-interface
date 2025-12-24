/**
 * FiltersPanel: Gère le panneau de filtres avec badge et réinitialisation
 * Extrait de createFloatingActionBar pour améliorer la lisibilité
 */
(function($) {
	window.FiltersPanel = {
		/**
		 * Crée le panneau de filtres et le bouton associé
		 * @param {jQuery} $nav - Élément jQuery de la navigation
		 * @param {Object} customActions - Objet des actions personnalisées
		 * @returns {Object} - Objet contenant $filtersButton, $filtersPanel, $filtersOverlay, $filtersPanelContent
		 */
		create: function($nav, customActions) {
			// S'assurer que customActions est défini
			if (!customActions) {
				customActions = {};
			}
			
			// Créer le bouton "Filtres" pour ouvrir le sur-panel
			var $filtersButton = $('<button type="button" class="ngWPAdminUI-filters-button" title="Filtres"><span class="material-icons">filter_list</span><span class="ngWPAdminUI-filters-badge"></span></button>');
			
			// Créer le voile sombre
			var $filtersOverlay = $('<div class="ngWPAdminUI-filters-overlay"></div>');
			
			// Créer le sur-panel des filtres
			var $filtersPanel = $('<div class="ngWPAdminUI-filters-panel"></div>');
			var $filtersPanelContent = $('<div class="ngWPAdminUI-filters-panel-content"></div>');
			var $filtersPanelHeader = $('<div class="ngWPAdminUI-filters-panel-header"><h3><span class="material-icons">filter_list</span> <span class="ngWPAdminUI-filters-panel-title"></span></h3><button type="button" class="ngWPAdminUI-filters-close"><span class="dashicons dashicons-no-alt"></span></button></div>');
			
			// Créer le bouton de réinitialisation en bas du panel
			var $filtersResetButton = $('<div class="ngWPAdminUI-filters-reset-container"><button type="button" class="ngWPAdminUI-filters-reset-button"><span class="material-icons">filter_list_off</span> Réinitialiser les filtres</button></div>');
			
			// Récupérer les filtres depuis le DOM original
			// Pourquoi: utiliser customActions depuis la closure (paramètre de la fonction create)
			// Note: $nav est .tablenav.top, les filtres sont dans .actions > *
			var $filtersElements = $nav.find('.actions > *');
			
			$filtersElements.each(function(){
				// Vérifier que this est un élément DOM valide
				if (!this || !this.nodeType || this.nodeType !== 1) {
					return;
				}
				
				var $original = $(this);
				
				// Vérifier que c'est un objet jQuery valide
				if (!$original.length) {
					return;
				}
				
				// Ignorer les éléments d'action (select[name="action"], boutons Apply, etc.)
				if ($original.is('select[name="action"], select[name="action2"]') || 
					$original.is('input[type="submit"][value="Apply"]') ||
					$original.closest('.bulkactions').length > 0) {
					return;
				}

				// Ignorer les éléments déjà traités comme boutons personnalisés
				// Pourquoi: utiliser customActions depuis la closure (paramètre de la fonction create)
				var isCustomAction = false;
				if ($original.is('select')) {
					var value = $original.val();
					if (customActions && customActions[value]) {
						isCustomAction = true;
					}
				}
				if (isCustomAction) return;
				
				// Cloner l'élément
				try {
					var $clone = $original.clone();
				} catch (e) {
					// Ignorer silencieusement les erreurs de clonage pour éviter de bloquer l'interface
					return;
				}
				
				// Copier les attributs importants
				$clone.attr('id', $original.attr('id') + '-floating');
				$clone.attr('name', $original.attr('name'));
				$clone.attr('form', $original.attr('form'));
				$clone.attr('type', $original.attr('type'));
				$clone.attr('value', $original.attr('value'));
				
				// Pour les boutons, déclencher l'action sur l'original
				if ($clone.is('button, input[type="submit"]')) {
					$clone.on('click', function(e){
						e.preventDefault();
						$original.trigger('click');
					});
				}
				
				// Pour les selects, synchroniser avec l'original
				if ($clone.is('select')) {
					$clone.on('change', function(){
						$original.val($(this).val()).trigger('change');
						window.FiltersPanel.updateBadge($filtersPanelContent, $filtersButton); // Mettre à jour le badge
					});
					$original.on('change', function(){
						$clone.val($(this).val());
						window.FiltersPanel.updateBadge($filtersPanelContent, $filtersButton); // Mettre à jour le badge
					});
				}
				
				// Pour les inputs, synchroniser avec l'original
				if ($clone.is('input[type="text"], input[type="search"], input[type="date"], input[type="number"]')) {
					$clone.on('input', function(){
						$original.val($(this).val()).trigger('input');
						window.FiltersPanel.updateBadge($filtersPanelContent, $filtersButton); // Mettre à jour le badge
					});
					$original.on('input', function(){
						$clone.val($(this).val());
						window.FiltersPanel.updateBadge($filtersPanelContent, $filtersButton); // Mettre à jour le badge
					});
				}
				
				$filtersPanelContent.append($clone);
			});
			
			// Assembler le panel des filtres
			$filtersPanel.append($filtersPanelHeader).append($filtersPanelContent).append($filtersResetButton);
			
			// Configurer les gestionnaires d'événements
			this.setupEventHandlers($filtersButton, $filtersPanel, $filtersOverlay, $filtersPanelContent, $nav);
			
			return {
				$filtersButton: $filtersButton,
				$filtersPanel: $filtersPanel,
				$filtersOverlay: $filtersOverlay,
				$filtersPanelContent: $filtersPanelContent
			};
		},
		
		/**
		 * Configure les gestionnaires d'événements pour le panneau de filtres
		 */
		setupEventHandlers: function($filtersButton, $filtersPanel, $filtersOverlay, $filtersPanelContent, $nav) {
			
			// Gérer l'ouverture/fermeture du panel des filtres
			$filtersButton.on('click', function(e){
				e.preventDefault();
				
				// Définir le titre du panel à partir du bouton filtres
				var filterButtonTitle = $filtersButton.attr('title') || 'Filtres';
				$filtersPanel.find('.ngWPAdminUI-filters-panel-title').text(filterButtonTitle);
				
				$filtersPanel.addClass('ngWPAdminUI-filters-panel-open');
				$filtersOverlay.addClass('ngWPAdminUI-filters-overlay-open');
				$filtersButton.addClass('active');
				
				// Changer l'icône vers filter_list_off
				$filtersButton.find('.material-icons').text('filter_list_off');
				
				// Surbrillance des filtres actifs
				window.FiltersPanel.highlightActiveFilters($filtersPanelContent);
			});
			
			// Gérer le clic sur le bouton de réinitialisation
			$filtersPanel.find('.ngWPAdminUI-filters-reset-button').on('click', function(e){
				e.preventDefault();
				window.FiltersPanel.resetAllFilters($filtersPanelContent, $nav, $filtersButton);
			});
			
			$filtersPanel.find('.ngWPAdminUI-filters-close').on('click', function(e){
				e.preventDefault();
				window.FiltersPanel.close($filtersPanel, $filtersOverlay, $filtersButton);
			});
			
			// Fermer le panel en cliquant à l'extérieur ou sur l'overlay
			$(document).on('click', function(e){
				if (!$(e.target).closest('.ngWPAdminUI-filters-panel').length && 
					!$(e.target).closest('.ngWPAdminUI-filters-button').length) {
					window.FiltersPanel.close($filtersPanel, $filtersOverlay, $filtersButton);
				}
			});
			
			// Fermer en cliquant sur l'overlay
			$filtersOverlay.on('click', function(e){
				window.FiltersPanel.close($filtersPanel, $filtersOverlay, $filtersButton);
			});
			
			// Fermer avec Escape (géré dans SearchModal pour éviter les conflits)
		},
		
		/**
		 * Ferme le panel de filtres
		 */
		close: function($filtersPanel, $filtersOverlay, $filtersButton) {
			$filtersPanel.removeClass('ngWPAdminUI-filters-panel-open');
			$filtersOverlay.removeClass('ngWPAdminUI-filters-overlay-open');
			$filtersButton.removeClass('active');
			
			// Changer l'icône vers filter_list
			$filtersButton.find('.material-icons').text('filter_list');
		},
		
		/**
		 * Réinitialise tous les filtres
		 */
		resetAllFilters: function($filtersPanelContent, $nav, $filtersButton) {
			// Réinitialiser tous les selects à la première option
			$filtersPanelContent.find('select').each(function(){
				var $select = $(this);
				var $original = $nav.find('select[name="' + $select.attr('name') + '"]');
				$select.prop('selectedIndex', 0);
				$original.prop('selectedIndex', 0).trigger('change');
			});
			
			// Réinitialiser tous les inputs
			$filtersPanelContent.find('input[type="text"], input[type="search"], input[type="date"], input[type="number"]').each(function(){
				var $input = $(this);
				var $original = $nav.find('input[name="' + $input.attr('name') + '"]');
				$input.val('');
				$original.val('').trigger('input');
			});
			
			// Mettre à jour le badge
			this.updateBadge($filtersPanelContent, $filtersButton);
			
			// Déclencher le clic sur le bouton submit filter_action dans le panel
			var $filterSubmitButton = $filtersPanelContent.find('input[type="submit"][name="filter_action"]');
			if ($filterSubmitButton.length > 0) {
				$filterSubmitButton.trigger('click');
			}
		},
		
		/**
		 * Met à jour le badge des filtres actifs
		 */
		updateBadge: function($filtersPanelContent, $filtersButton) {
			var activeFiltersCount = 0;
			
			// Compter les selects qui ne sont pas sur la première option
			$filtersPanelContent.find('select').each(function(){
				var $select = $(this);
				var selectedIndex = $select.prop('selectedIndex');
				if (selectedIndex > 0) { // Pas la première option (généralement "Tous" ou "-1")
					activeFiltersCount++;
				}
			});
			
			// Compter les inputs avec une valeur
			$filtersPanelContent.find('input[type="text"], input[type="search"], input[type="date"], input[type="number"]').each(function(){
				var $input = $(this);
				var value = $input.val().trim();
				if (value !== '' && value !== '0') {
					activeFiltersCount++;
				}
			});
			
			// Mettre à jour le badge
			var $badge = $filtersButton.find('.ngWPAdminUI-filters-badge');
			if (activeFiltersCount > 0) {
				$badge.text(activeFiltersCount).show();
			} else {
				$badge.hide();
			}
		},
		
		/**
		 * Surbrille les filtres actifs
		 */
		highlightActiveFilters: function($filtersPanelContent) {
			// Retirer toutes les surbrillances existantes
			$filtersPanelContent.find('.ngWPAdminUI-filter-active-highlight').removeClass('ngWPAdminUI-filter-active-highlight');
			
			// Surbriller les selects actifs
			$filtersPanelContent.find('select').each(function(){
				var $select = $(this);
				var selectedIndex = $select.prop('selectedIndex');
				if (selectedIndex > 0) {
					$select.addClass('ngWPAdminUI-filter-active-highlight');
				}
			});
			
			// Surbriller les inputs avec une valeur
			$filtersPanelContent.find('input[type="text"], input[type="search"], input[type="date"], input[type="number"]').each(function(){
				var $input = $(this);
				var value = $input.val().trim();
				if (value !== '' && value !== '0') {
					$input.addClass('ngWPAdminUI-filter-active-highlight');
				}
			});
		}
	};
})(jQuery);

