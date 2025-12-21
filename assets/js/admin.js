(function($){
	// BetterInterfaceAdmin: gère les interactions de la page d’admin
	function BetterInterfaceAdmin(){
		this.currentMode = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_mode) || 'default';
		this.availableModes = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.available_modes) || {};
		this.currentColorTheme = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.current_color_theme) || 'midnight';
		this.availableColorThemes = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.available_color_themes) || {};
		this.ajaxUrl = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.ajax_url) || ajaxurl;
		this.nonce = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.nonce) || '';

		this.selectedMode = null;
		this.selectedTheme = null;
	}

	BetterInterfaceAdmin.prototype.init = function(){
		this.initAccordionTables();
		this.bindRowBackgroundSelect();
		this.bindRowCheckboxSync();
		this.initializeSelectedRowsState();
		this.initPageTransition();
		this.initNoticesPositioning();
	};



	// ===== Barre d'actions flottante =====
	BetterInterfaceAdmin.prototype.initAccordionTables = function(){
		var self = this;
		$('.tablenav.top').each(function(){
			var $nav = $(this);

			// Créer une barre flottante sur tous les supports
			self.createFloatingActionBar($nav);
			
			// Gérer le redimensionnement de la fenêtre pour adapter la largeur
			$(window).on('resize', function(){
				$('.ngBetterInterface-floating-action-bar').toggleClass('ngBetterInterface-full-width', window.innerWidth < 768);
			});
		});
	};

	BetterInterfaceAdmin.prototype.isInteractive = function($el){
		return $el.is('button, input, select, textarea, a, label, [contenteditable="true"]') || $el.closest('button, input, select, textarea, a, label, [contenteditable="true"]').length > 0;
	};



			// Créer une barre d'actions flottante en bas de l'écran
		BetterInterfaceAdmin.prototype.createFloatingActionBar = function($nav){
			var self = this;
			
					// Créer le container de la barre flottante
		var $floatingBar = $('<div class="ngBetterInterface-floating-action-bar slide-out"></div>');
		var $actionsContainer = $('<div class="ngBetterInterface-floating-actions"></div>');
		var $paginationContainer = $('<div class="ngBetterInterface-floating-pagination"></div>');
		
		// Récupérer le nom des éléments depuis le titre de la page
		var itemName = 'selected';
		var $pageTitle = $('h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			itemName = $pageTitle.text().trim().toLowerCase();
			// Nettoyer le nom (retirer les pluriels, articles, etc.)
			itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
		}
		
		// Récupérer le nombre total d'éléments depuis .displaying-num
		var totalItems = 0;
		var $displayingNum = $('.displaying-num');
		if ($displayingNum.length > 0) {
			var displayingText = $displayingNum.text().trim();
			// Extraire le nombre du texte (gère différents formats)
			// "Showing 1-20 of 100 items" -> 100
			// "100 items" -> 100
			// "Showing 1-20 of 100" -> 100
			var match = displayingText.match(/(\d+)(?=\s*(?:items?|$))/i) || displayingText.match(/(\d+)$/);
			if (match) {
				totalItems = parseInt(match[1]);
			}
		}
		

		
		// Créer le compteur d'éléments sélectionnés avec bouton de désélection
		var deselectAllText = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.i18n && ngBetterInterface_ajax.i18n.deselect_all) || 'Deselect';
		var $counter = $('<div class="ngBetterInterface-selection-counter"><div class="ngBetterInterface-counter-content"><span class="ngBetterInterface-counter-number">' + totalItems + '</span><span class="ngBetterInterface-counter-text">' + itemName + '</span></div><button type="button" class="ngBetterInterface-deselect-all" title="' + deselectAllText + '"><span class="dashicons dashicons-no-alt"></span></button></div>');
		
		// Configurer le bouton de désélection
		$counter.find('.ngBetterInterface-deselect-all').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			
			// Désélectionner toutes les cases à cocher
			$('.wp-list-table tbody input[type="checkbox"]:checked').prop('checked', false).trigger('change');
			
			// Désélectionner les cases "tout sélectionner"
			$('.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]').prop('checked', false).trigger('change');
		});
		
		// Ajouter le bouton delete_all à gauche du compteur s'il existe
		if ($deleteAllButtonCustom) {
			$actionsContainer.append($deleteAllButtonCustom);
		}
		$actionsContainer.append($counter);
		
		// Utiliser la configuration des actions personnalisées depuis le fichier externe
		var customActions = window.ngBetterInterfaceCustomActions || {};
		
		// Ajouter le bouton delete_all s'il existe
		var $deleteAllButton = $nav.find('#delete_all');
		if ($deleteAllButton.length > 0) {
			customActions['delete_all'] = {
				buttonClass: 'ngBetterInterface-delete-all-button',
				title: 'Delete All',
				icon: '<span class="material-icons">cleaning_services</span>',
				backgroundColor: '#dc2996',
				hoverBackgroundColor: '#b91c1c',
				alwaysVisible: true
			};
		}
		
		// Traiter les actions du select et le bouton delete_all
		var $actionSelect = $nav.find('#bulk-action-selector-top');
		var customButtons = [];
		var groupedButtons = {};
		
		// Traiter le bouton delete_all s'il existe
		var $deleteAllButtonCustom = null;
		if ($deleteAllButton.length > 0) {
			var action = customActions['delete_all'];
			var $button = $('<button type="button" class="' + action.buttonClass + '" title="' + action.title + '" data-action="delete_all" data-always-visible="true">' + action.icon + '</button>');
			
			// Stocker l'icône originale dans les données du bouton
			$button.data('original-icon', action.icon);
			
			// Appliquer les couleurs personnalisées
			if (action.backgroundColor) {
				$button.css('background', action.backgroundColor);
			}
			if (action.hoverBackgroundColor) {
				$button.data('hover-color', action.hoverBackgroundColor);
			}
			
			// Configurer l'action du bouton
			$button.on('click', function(e){
				e.preventDefault();
				
				// Popup de confirmation pour l'action delete_all
				var confirmText = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.i18n && ngBetterInterface_ajax.i18n.confirm_delete_all) || 'Are you sure you want to delete all items? This action cannot be undone.';
				
				if (confirm(confirmText)) {
					// Déclencher le clic sur le bouton original
					$deleteAllButton.trigger('click');
				}
			});
			
			$deleteAllButtonCustom = $button;
			
			// Masquer le bouton original
			$deleteAllButton.hide();
		}
		
		if ($actionSelect.length > 0) {
			// Énumérer les options du select
			$actionSelect.find('option').each(function(){
				var $option = $(this);
				var value = $option.val();
				
				// Ignorer l'option par défaut
				if (value === '-1') return;
				
				// Vérifier si c'est une action personnalisée
				if (customActions[value]) {
					var action = customActions[value];
					var buttonAttributes = 'class="' + action.buttonClass + '" title="' + action.title + '" data-action="' + value + '"';
					
					// Ajouter l'attribut data-always-visible si l'action est toujours visible
					if (action.alwaysVisible) {
						buttonAttributes += ' data-always-visible="true"';
					}
					
					var $button = $('<button type="button" ' + buttonAttributes + '>' + action.icon + '</button>');
					
					// Stocker l'icône originale dans les données du bouton
					$button.data('original-icon', action.icon);
					
					// Appliquer les couleurs personnalisées si définies
					if (action.backgroundColor) {
						$button.css('background', action.backgroundColor);
					}
					if (action.hoverBackgroundColor) {
						$button.data('hover-color', action.hoverBackgroundColor);
					}
					
					// Configurer l'action du bouton
					$button.on('click', function(e){
						e.preventDefault();
						
						// Vérifier qu'il y a des éléments sélectionnés
						var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
						if (selectedCount === 0) {
							var pleaseSelectText = (window.ngBetterInterface_ajax && ngBetterInterface_ajax.i18n && ngBetterInterface_ajax.i18n.please_select_items) || 'Please select at least one item to perform this action on.';
							alert(pleaseSelectText);
							return;
						}
						
						// Remplacer l'icône par une icône de chargement WordPress
						var loadingIcon = '<span class="dashicons dashicons-update ngBetterInterface-loading-spinner"></span>';
						
						$(this).html(loadingIcon);
						
						// Désactiver le bouton pendant le chargement
						$(this).prop('disabled', true).addClass('loading');
						
						// S'assurer que le select est visible et fonctionnel
						$actionSelect.show();
						
						// Définir la valeur et déclencher l'action
						$actionSelect.val(value);
						
						// Déclencher le changement immédiatement
						$actionSelect.trigger('change');
						
						// Déclencher automatiquement le bouton Apply
						var $applyButton = $nav.find('input[type="submit"][value="Apply"]');
						if ($applyButton.length > 0) {
							$applyButton.show().trigger('click');
						}
					});
					
					// Grouper les boutons selon leur configuration
					if (action.group) {
						if (!groupedButtons[action.group]) {
							groupedButtons[action.group] = [];
						}
						groupedButtons[action.group].push($button);
					} else {
						customButtons.push($button);
					}
					
					// Masquer l'option au lieu de la supprimer
					$option.hide();
				}
			});
			
			// Ajouter d'abord les boutons groupés
			Object.keys(groupedButtons).forEach(function(groupName) {
				var buttons = groupedButtons[groupName];
				if (buttons.length > 0) {
					var $group = $('<div class="ngBetterInterface-button-group ngBetterInterface-' + groupName + '-group"></div>');
					buttons.forEach(function($button, index){
						// Ajouter les classes utilitaires pour les border-radius
						if (index === 0) {
							$button.addClass('no-br-right');
						} else if (index === buttons.length - 1) {
							$button.addClass('no-br-left');
						} else {
							$button.addClass('no-br-left no-br-right');
						}
						$group.append($button);
					});
					$actionsContainer.append($group);
				}
			});
			
			// Puis les boutons individuels
			customButtons.forEach(function($button){
				$actionsContainer.append($button);
			});
			
			// Appliquer les événements hover pour les couleurs personnalisées
			$('.ngBetterInterface-floating-action-bar button[data-hover-color]').each(function(){
				var $button = $(this);
				var hoverColor = $button.data('hover-color');
				var originalColor = $button.css('background');
				
				$button.on('mouseenter', function(){
					$(this).css('background', hoverColor);
				}).on('mouseleave', function(){
					$(this).css('background', originalColor);
				});
			});
			
			// Vérifier s'il ne reste qu'une seule option non convertie en bouton
			var nonConvertedOptions = 0;
			$actionSelect.find('option').each(function(){
				var $option = $(this);
				var value = $option.val();
				// Compter seulement les options qui ne sont pas converties en boutons personnalisés
				if (value !== '-1' && !customActions[value]) {
					nonConvertedOptions++;
				}
			});
			
			// Si toutes les options sont soit converties en boutons soit l'option par défaut, masquer le select
			if (nonConvertedOptions === 0) {
				// Masquer le select et le bouton Apply
				$actionSelect.css({
					'opacity': '0',
					'width': '0',
					'overflow': 'hidden'
				});
				$actionSelect.next('input[type="submit"]').css({
					'opacity': '0',
					'width': '0',
					'overflow': 'hidden'
				});
			}
		}
		
		// Intercepter les soumissions de formulaires pour détecter les actions AJAX
		$(document).on('submit', 'form', function(e){
			var $form = $(this);
			var $submitButton = $form.find('input[type="submit"][value="Apply"]');
			
			// Vérifier si c'est un formulaire d'action en lot
			if ($submitButton.length > 0 && $form.find('select[name="action"], select[name="action2"]').length > 0) {
				// Trouver le bouton personnalisé correspondant
				var actionValue = $form.find('select[name="action"]').val() || $form.find('select[name="action2"]').val();
				var $customButton = $('.ngBetterInterface-floating-action-bar button[data-action="' + actionValue + '"]');
				
				if ($customButton.length > 0) {
					// Marquer le bouton comme en cours de traitement
					$customButton.addClass('processing');
					
					// Stocker l'URL de la requête pour la détection
					$customButton.data('request-url', $form.attr('action') || window.location.href);
				}
			}
		});
		
		// Écouter les événements de fin de requête AJAX
		$(document).ajaxComplete(function(event, xhr, settings){
			// Vérifier si c'est une requête d'action en lot WordPress
			if (settings.url && (settings.url.includes('admin-ajax.php') || settings.url.includes('edit.php') || settings.url.includes('post.php'))) {
				// Restaurer tous les boutons en cours de traitement
				$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
					var $button = $(this);
					var $originalIcon = $button.data('original-icon');
					
					if ($originalIcon) {
						$button.html($originalIcon);
					}
					
					$button.prop('disabled', false).removeClass('loading processing');
				});
			}
			

		});
		
		// Écouter aussi les redirections et rechargements de page
		$(window).on('beforeunload', function(){
			// Restaurer tous les boutons avant le rechargement
			$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
				var $button = $(this);
				var $originalIcon = $button.data('original-icon');
				
				if ($originalIcon) {
					$button.html($originalIcon);
				}
				
				$button.prop('disabled', false).removeClass('loading processing');
			});
		});

		// Écouter aussi les erreurs AJAX pour restaurer les boutons
		$(document).ajaxError(function(event, xhr, settings, error){
			// Restaurer tous les boutons en cours de traitement en cas d'erreur
			$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
				var $button = $(this);
				var $originalIcon = $button.data('original-icon');
				
				if ($originalIcon) {
					$button.html($originalIcon);
				}
				
				$button.prop('disabled', false).removeClass('loading processing');
			});
		});

		// Écouter les changements de DOM pour détecter les mises à jour de la page
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				// Si des notices WordPress apparaissent, c'est probablement la fin d'une action
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];
						if (node.nodeType === 1 && node.classList && node.classList.contains('notice')) {
							// Une notice WordPress est apparue, restaurer les boutons
							$('.ngBetterInterface-floating-action-bar button.loading').each(function(){
								var $button = $(this);
								var $originalIcon = $button.data('original-icon');
								
								if ($originalIcon) {
									$button.html($originalIcon);
								}
								
								$button.prop('disabled', false).removeClass('loading processing');
							});
							break;
						}
					}
				}
			});
		});

		// Observer les changements dans le body
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		
		// Créer le bouton "Filtres" pour ouvrir le sur-panel
		var $filtersButton = $('<button type="button" class="ngBetterInterface-filters-button" title="Filtres"><span class="material-icons">filter_list</span><span class="ngBetterInterface-filters-badge"></span></button>');
		
		// Créer le voile sombre
		var $filtersOverlay = $('<div class="ngBetterInterface-filters-overlay"></div>');
		
		// Créer le sur-panel des filtres
		var $filtersPanel = $('<div class="ngBetterInterface-filters-panel"></div>');
		var $filtersPanelContent = $('<div class="ngBetterInterface-filters-panel-content"></div>');
		var $filtersPanelHeader = $('<div class="ngBetterInterface-filters-panel-header"><h3><span class="material-icons">filter_list</span> <span class="ngBetterInterface-filters-panel-title"></span></h3><button type="button" class="ngBetterInterface-filters-close"><span class="dashicons dashicons-no-alt"></span></button></div>');
		
		// Créer le bouton de réinitialisation en bas du panel
		var $filtersResetButton = $('<div class="ngBetterInterface-filters-reset-container"><button type="button" class="ngBetterInterface-filters-reset-button"><span class="material-icons">filter_list_off</span> Réinitialiser les filtres</button></div>');
		
		// Détecter et créer le bouton "Ajouter" personnalisé
		var $addButton = null;
		
		// Tableau des conditions pour détecter les boutons "Ajouter"
		var addButtonConditions = [
			{
				selector: '.wrap h1.wp-heading-inline + a.page-title-action[href*="wp-admin/post-new.php"]',
				description: 'Bouton Ajouter WordPress standard'
			},
			{
				selector: '#wpcf7-contact-form-list-table h1 + a[href*="wpcf7-new"]',
				description: 'Bouton Ajouter Contact Form 7'
			}
			// Ajouter facilement d'autres conditions ici
			// {
			//     selector: 'SELECTEUR_CSS',
			//     description: 'Description du bouton'
			// }
		];
		
		// Chercher le premier bouton "Ajouter" qui correspond aux conditions
		var $originalAddButton = null;
		for (var i = 0; i < addButtonConditions.length; i++) {
			var condition = addButtonConditions[i];
			var $foundButton = $(condition.selector);
			if ($foundButton.length > 0) {
				$originalAddButton = $foundButton;
				console.log('Bouton "Ajouter" détecté:', condition.description);
				break;
			}
		}
		
		if ($originalAddButton && $originalAddButton.length > 0) {
			var addButtonHref = $originalAddButton.attr('href');
			
			// Créer le gros bouton "Ajouter"
			$addButton = $('<a href="' + addButtonHref + '" class="ngBetterInterface-add-button"><span class="material-icons">add</span></a>');
			
			// Masquer le bouton original
			$originalAddButton.hide();
		}
		
		// Détecter et créer la modale de recherche
		var $searchModal = null;
		var $searchButton = null;
		var $originalSearchBox = $('.subsubsub + #posts-filter .search-box, .subsubsub + #comments-form .search-box, #wpcf7-contact-form-list-table .search-box');
		if ($originalSearchBox.length > 0) {
			// Créer le bouton "Rechercher" dans la barre flottante
			$searchButton = $('<button type="button" class="ngBetterInterface-search-button" title="Rechercher"><span class="material-icons">search</span></button>');
			
			// Créer la modale de recherche
			$searchModal = $('<div class="ngBetterInterface-search-modal"><div class="ngBetterInterface-search-modal-content"><div class="ngBetterInterface-search-modal-header"><h3><span class="material-icons">search</span> Rechercher</h3><button type="button" class="ngBetterInterface-search-modal-close"><span class="dashicons dashicons-no-alt"></span></button></div><div class="ngBetterInterface-search-modal-body"></div></div></div>');
			
			// Cloner le contenu de la search-box dans la modale
			var $searchBoxClone = $originalSearchBox.clone();
			$searchModal.find('.ngBetterInterface-search-modal-body').append($searchBoxClone);
			
			// Détecter le type de posts actuel
			var currentPostType = self.detectCurrentPostType();
			
			// Créer le container pour les suggestions
			var $suggestionsContainer = $('<div class="ngBetterInterface-search-suggestions"></div>');
			$searchModal.find('.ngBetterInterface-search-modal-body').append($suggestionsContainer);
			
			// Gérer la soumission de la recherche dans la modale
			function performSearch() {
				var searchQuery = $searchModal.find('input[type="search"], input[type="text"]').val().trim();
				
				if (searchQuery) {
					// Construire la nouvelle URL avec le paramètre de recherche
					var currentUrl = window.location.href;
					var newUrl;
					
					// Supprimer le paramètre paged s'il existe (retour à la première page)
					currentUrl = currentUrl.replace(/[?&]paged=\d+/, '');
					
					// Vérifier si le paramètre s existe déjà avec une regex plus précise
					if (currentUrl.match(/[?&]s=/)) {
						// Remplacer le paramètre s existant
						newUrl = currentUrl.replace(/[?&]s=[^&]*/, function(match) {
							return match.charAt(0) === '?' ? '?s=' + encodeURIComponent(searchQuery) : '&s=' + encodeURIComponent(searchQuery);
						});
					} else {
						// Ajouter le paramètre s
						var separator = currentUrl.includes('?') ? '&' : '?';
						newUrl = currentUrl + separator + 's=' + encodeURIComponent(searchQuery);
					}
					
					console.log(newUrl)
					// Rediriger vers la nouvelle URL
					window.location.href = newUrl;
				}
			}
			
			// Gérer la touche Entrée sur l'input de recherche
			$searchModal.find('input[type="search"], input[type="text"]').on('keypress', function(e){
				if (e.which === 13) { // Touche Entrée
					e.preventDefault();
					performSearch();
				}
			});
			
			// Gérer les suggestions en temps réel
			var searchTimeout;
			$searchModal.find('input[type="search"], input[type="text"]').on('input', function(){
				var query = $(this).val().trim();
				
				// Effacer le timeout précédent
				clearTimeout(searchTimeout);
				
				// Masquer les suggestions si la requête est trop courte
				if (query.length < 2) {
					$suggestionsContainer.empty().hide();
					return;
				}
				
				// Délai pour éviter trop de requêtes
				searchTimeout = setTimeout(function(){
					self.fetchSearchSuggestions(query, currentPostType, $suggestionsContainer);
				}, 300);
			});
			
			// Gérer le clic sur le bouton de recherche
			$searchModal.find('input[type="submit"], button[type="submit"]').on('click', function(e){
				e.preventDefault();
				performSearch();
			});
			
			// Masquer la search-box originale
			$originalSearchBox.hide();
		}
		
		// Récupérer les filtres depuis le DOM original
		$nav.find('.actions > *').each(function(){
			var $original = $(this);
			
			// Ignorer les éléments d'action (select[name="action"], boutons Apply, etc.)
			if ($original.is('select[name="action"], select[name="action2"]') || 
				$original.is('input[type="submit"][value="Apply"]') ||
				$original.closest('.bulkactions').length > 0) {
			return;
		}

			// Ignorer les éléments déjà traités comme boutons personnalisés
			var isCustomAction = false;
			if ($original.is('select')) {
				var value = $original.val();
				if (customActions[value]) {
					isCustomAction = true;
				}
			}
			if (isCustomAction) return;
			
			var $clone = $original.clone();
			
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
				updateFiltersBadge(); // Mettre à jour le badge
			});
			$original.on('change', function(){
				$clone.val($(this).val());
				updateFiltersBadge(); // Mettre à jour le badge
			});
		}
			
					// Pour les inputs, synchroniser avec l'original
		if ($clone.is('input[type="text"], input[type="search"], input[type="date"], input[type="number"]')) {
			$clone.on('input', function(){
				$original.val($(this).val()).trigger('input');
				updateFiltersBadge(); // Mettre à jour le badge
			});
			$original.on('input', function(){
				$clone.val($(this).val());
				updateFiltersBadge(); // Mettre à jour le badge
			});
		}
			
			$filtersPanelContent.append($clone);
		});
		
		// Assembler le panel des filtres
		$filtersPanel.append($filtersPanelHeader).append($filtersPanelContent).append($filtersResetButton);
		
		// Gérer l'ouverture/fermeture du panel des filtres
		$filtersButton.on('click', function(e){
			e.preventDefault();
			
			// Définir le titre du panel à partir du bouton filtres
			var filterButtonTitle = $filtersButton.attr('title') || 'Filtres';
			$filtersPanel.find('.ngBetterInterface-filters-panel-title').text(filterButtonTitle);
			
			$filtersPanel.addClass('ngBetterInterface-filters-panel-open');
			$filtersOverlay.addClass('ngBetterInterface-filters-overlay-open');
			$filtersButton.addClass('active');
			
			// Changer l'icône vers filter_list_off
			$filtersButton.find('.material-icons').text('filter_list_off'); // Changed to filter_list_off
			
			// Surbrillance des filtres actifs
			highlightActiveFilters();
		});
		
		// Gérer l'ouverture/fermeture de la modale de recherche
		if ($searchButton && $searchModal) {
			$searchButton.on('click', function(e){
				e.preventDefault();
				$searchModal.addClass('ngBetterInterface-search-modal-open');
				$searchButton.addClass('active');
				
				// Focus sur l'input de recherche
				setTimeout(function(){
					$searchModal.find('input[type="search"], input[type="text"]').focus();
				}, 300);
			});
			
			// Fermer la modale avec le bouton close
			$searchModal.find('.ngBetterInterface-search-modal-close').on('click', function(e){
				e.preventDefault();
				closeSearchModal();
			});
			
			// Fermer la modale en cliquant en dehors
			$searchModal.on('click', function(e){
				if (e.target === this) {
					closeSearchModal();
				}
			});
			
			// Fermer la modale avec la touche Escape
			$(document).on('keydown', function(e){
				if (e.key === 'Escape') {
					// Fermer la modale de recherche si elle est ouverte
					if ($searchModal && $searchModal.hasClass('ngBetterInterface-search-modal-open')) {
						closeSearchModal();
					}
					// Fermer le panel de filtres s'il est ouvert
					if ($filtersPanel && $filtersPanel.hasClass('ngBetterInterface-filters-panel-open')) {
						closeFiltersPanel();
					}
				}
			});
		}
		
		// Fonction pour fermer la modale de recherche
		function closeSearchModal() {
			$searchModal.removeClass('ngBetterInterface-search-modal-open');
			$searchButton.removeClass('active');
		}
		
		// Fonction pour fermer le panel et changer l'icône
		function closeFiltersPanel() {
			$filtersPanel.removeClass('ngBetterInterface-filters-panel-open');
			$filtersOverlay.removeClass('ngBetterInterface-filters-overlay-open');
			$filtersButton.removeClass('active');
			
			// Changer l'icône vers filter_list_off
			$filtersButton.find('.material-icons').text('filter_list');
		}
		
		// Fonction pour réinitialiser tous les filtres
		function resetAllFilters() {
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
			updateFiltersBadge();
			
			// Déclencher le clic sur le bouton submit filter_action dans le panel
			var $filterSubmitButton = $filtersPanelContent.find('input[type="submit"][name="filter_action"]');
			if ($filterSubmitButton.length > 0) {
				$filterSubmitButton.trigger('click');
			}
		}
		
		// Gérer le clic sur le bouton de réinitialisation
		$filtersPanel.find('.ngBetterInterface-filters-reset-button').on('click', function(e){
			e.preventDefault();
			resetAllFilters();
		});
		
		$filtersPanel.find('.ngBetterInterface-filters-close').on('click', function(e){
			e.preventDefault();
			closeFiltersPanel();
		});
		
		// Fermer le panel en cliquant à l'extérieur ou sur l'overlay
		$(document).on('click', function(e){
			if (!$(e.target).closest('.ngBetterInterface-filters-panel').length && 
				!$(e.target).closest('.ngBetterInterface-filters-button').length) {
				closeFiltersPanel();
			}
		});
		
		// Fermer en cliquant sur l'overlay
		$filtersOverlay.on('click', function(e){
			closeFiltersPanel();
		});
		
		// Fonction pour compter les filtres actifs
		function updateFiltersBadge() {
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
			var $badge = $filtersButton.find('.ngBetterInterface-filters-badge');
			if (activeFiltersCount > 0) {
				$badge.text(activeFiltersCount).show();
			} else {
				$badge.hide();
			}
		}
		
		// Fonction pour surbriller les filtres actifs
		function highlightActiveFilters() {
			// Retirer toutes les surbrillances existantes
			$filtersPanelContent.find('.ngBetterInterface-filter-active-highlight').removeClass('ngBetterInterface-filter-active-highlight');
			
			// Surbriller les selects actifs
			$filtersPanelContent.find('select').each(function(){
				var $select = $(this);
				var selectedIndex = $select.prop('selectedIndex');
				if (selectedIndex > 0) {
					$select.addClass('ngBetterInterface-filter-active-highlight');
				}
			});
			
			// Surbriller les inputs avec une valeur
			$filtersPanelContent.find('input[type="text"], input[type="search"], input[type="date"], input[type="number"]').each(function(){
				var $input = $(this);
				var value = $input.val().trim();
				if (value !== '' && value !== '0') {
					$input.addClass('ngBetterInterface-filter-active-highlight');
				}
			});
		}
		
		// Créer la pagination moderne
		var currentPage = 1;
		var $currentPageInput = $('#current-page-selector');
		if ($currentPageInput.length > 0) {
			currentPage = parseInt($currentPageInput.val()) || 1;
		}
		
		// Récupérer le nombre total de pages depuis l'URL ou les éléments existants
		var totalPages = 1;
		var $pagination = $('.tablenav-pages, .wp-pagenavi, .pagination').first();
		if ($pagination.length > 0) {
			// Essayer de trouver le nombre total de pages dans les liens existants
			var maxPage = 0;
			$pagination.find('a').each(function(){
				var href = $(this).attr('href');
				if (href) {
					var match = href.match(/[?&]paged=(\d+)/);
					if (match) {
						var pageNum = parseInt(match[1]);
						if (pageNum > maxPage) maxPage = pageNum;
					}
				}
			});
			
			// Logique corrigée : si on trouve des liens, le totalPages = maxPage + 1
			// car maxPage représente la dernière page accessible, pas le nombre total
			if (maxPage > 0) {
				totalPages = maxPage + 1;
			}
			
			// Vérification alternative : chercher dans le texte de pagination existant
			var paginationText = $pagination.text();
			var totalMatch = paginationText.match(/(\d+)\s*\/\s*(\d+)/);
			if (totalMatch && totalMatch[2]) {
				totalPages = parseInt(totalMatch[2]);
			}
		}
		
		// Créer les éléments de pagination
		// Afficher la pagination si il y a plus d'une page OU si on est sur une page > 1
		var pageNumberClass = (totalPages > 1 || currentPage > 1) ? '' : 'ngBetterInterface-pagination-hide';
		var $paginationElements = $('<div class="ngBetterInterface-modern-pagination '+pageNumberClass+'"></div>');
		
		// Bouton première page
		if (currentPage > 1) {
			var $firstPageBtn = $('<button type="button" class="ngBetterInterface-pagination-btn ngBetterInterface-pagination-first" title="Première page"><span class="dashicons dashicons-controls-skipback"></span></button>');
			$firstPageBtn.on('click', function(){
				changePage(1);
			});
			$paginationElements.append($firstPageBtn);
		}
		
		// Bouton page précédente
		if (currentPage > 1) {
			var $prevPageBtn = $('<button type="button" class="ngBetterInterface-pagination-btn ngBetterInterface-pagination-prev" title="Page précédente"><span class="dashicons dashicons-controls-back"></span></button>');
			$prevPageBtn.on('click', function(){
				changePage(currentPage - 1);
			});
			$paginationElements.append($prevPageBtn);
		}
		
		// Champ de saisie de la page actuelle
		var $pageInput = $('<input type="number" class="ngBetterInterface-pagination-input" value="' + currentPage + '" min="1" max="' + totalPages + '" title="Page actuelle" />');
		$pageInput.on('change', function(){
			var newPage = parseInt($(this).val());
			if (newPage >= 1 && newPage <= totalPages) {
				changePage(newPage);
			} else {
				$(this).val(currentPage); // Remettre la valeur actuelle si invalide
			}
		});
		$pageInput.on('keypress', function(e){
			if (e.which === 13) { // Enter
				$(this).trigger('change');
			}
		});
		$paginationElements.append($pageInput);
		
		// Séparateur "sur"
		var $separator = $('<span class="ngBetterInterface-pagination-separator">/</span>');
		$paginationElements.append($separator);
		
		// Nombre total de pages
		var $totalPages = $('<span class="ngBetterInterface-pagination-total">' + totalPages + '</span>');
		$paginationElements.append($totalPages);
		
		// Bouton page suivante
		if (currentPage < totalPages) {
			var $nextPageBtn = $('<button type="button" class="ngBetterInterface-pagination-btn ngBetterInterface-pagination-next" title="Page suivante"><span class="dashicons dashicons-controls-forward"></span></button>');
			$nextPageBtn.on('click', function(){
				changePage(currentPage + 1);
			});
			$paginationElements.append($nextPageBtn);
		}
		
		// Bouton dernière page
		if (currentPage < totalPages) {
			var $lastPageBtn = $('<button type="button" class="ngBetterInterface-pagination-btn ngBetterInterface-pagination-last" title="Dernière page"><span class="dashicons dashicons-controls-skipforward"></span></button>');
			$lastPageBtn.on('click', function(){
				changePage(totalPages);
			});
			$paginationElements.append($lastPageBtn);
		}
		
		// Fonction pour changer de page
		function changePage(page) {
			var currentUrl = window.location.href;
			var newUrl;
			
			if (currentUrl.includes('paged=')) {
				// Remplacer le paramètre paged existant
				newUrl = currentUrl.replace(/[?&]paged=\d+/, function(match) {
					return match.charAt(0) === '?' ? '?paged=' + page : '&paged=' + page;
				});
			} else {
				// Ajouter le paramètre paged
				var separator = currentUrl.includes('?') ? '&' : '?';
				newUrl = currentUrl + separator + 'paged=' + page;
			}
			
			window.location.href = newUrl;
		}
		
		$paginationContainer.append($paginationElements);
		
		// Assembler la barre flottante avec le nouvel ordre
		// GAUCHE : Bouton Ajouter + Compteur + Actions
		var $leftSection = $('<div class="ngBetterInterface-floating-left"></div>');
		
		// Ajouter le bouton "Ajouter" en premier à gauche
		if ($addButton) {
			$leftSection.append($addButton);
		}
		
		// Ajouter le compteur après le bouton "Ajouter"
		$leftSection.append($counter);
		
		// Ajouter les actions après le compteur
		if ($actionsContainer.children().length > 0) {
			$leftSection.append($actionsContainer);
		}
		
		$floatingBar.append($leftSection);
		
		// DROITE : Delete All + Recherche + Filtres + Pagination
		var $rightSection = $('<div class="ngBetterInterface-floating-right"></div>');
		
		// Ajouter le bouton delete_all en premier à droite
		if ($deleteAllButtonCustom) {
			$rightSection.append($deleteAllButtonCustom);
		}
		
		// Ajouter le bouton recherche après delete_all
		if ($searchButton) {
			$rightSection.append($searchButton);
		}
		
		// Ajouter le bouton filtres après recherche
		if ($filtersPanelContent.children().length > 0) {
			$rightSection.append($filtersButton);
		}
		
		// Ajouter la pagination en dernier à droite
		if ($paginationContainer.children().length > 0) {
			$rightSection.append($paginationContainer);
		}
		
		$floatingBar.append($rightSection);
		
		// Ajouter le panel des filtres et l'overlay au body
		if ($filtersPanelContent.children().length > 0) {
			$('body').append($filtersOverlay);
			$('body').append($filtersPanel);
			
			// Initialiser le badge des filtres
			updateFiltersBadge();
		}
		
		// Ajouter la modale de recherche au body
		if ($searchModal) {
			$('body').append($searchModal);
		}
		
		// Ajouter au body si on a du contenu
		if ($floatingBar.children().length > 0) {
			$('body').append($floatingBar);
			
			// Gérer l'état des actions selon la sélection
			self.updateFloatingBarState();
			
			// Écouter les changements de sélection
			$(document).on('change', '.wp-list-table input[type="checkbox"]', function(){
				self.updateFloatingBarState();
			});
			
			// Appliquer la classe de largeur selon le format d'écran
			if (window.innerWidth < 768) {
				$floatingBar.addClass('ngBetterInterface-full-width');
			}
			
			// Masquer la navigation originale seulement sur desktop
			if (window.innerWidth >= 768) {
				$nav.hide();
			}
		}
	};

	// Mettre à jour l'état de la barre flottante (activer/désactiver les actions)
	BetterInterfaceAdmin.prototype.updateFloatingBarState = function(){
		var selectedCount = $('.wp-list-table tbody input[type="checkbox"]:checked').length;
		var hasSelectedItems = selectedCount > 0;
		var $actions = $('.ngBetterInterface-floating-actions button, .ngBetterInterface-floating-actions input[type="submit"], .ngBetterInterface-floating-actions select');
		var $customButtons = $('.ngBetterInterface-trash-button, .ngBetterInterface-edit-button, .ngBetterInterface-update-button, .ngBetterInterface-delete-all-button');
		var $counter = $('.ngBetterInterface-selection-counter');
		
		// Vérifier si une case "sélectionner tout" est cochée
		var $selectAll1 = $('#cb-select-all-1');
		var $selectAll2 = $('#cb-select-all-2');
		var isFullySelected = ($selectAll1.length > 0 && $selectAll1.is(':checked')) || ($selectAll2.length > 0 && $selectAll2.is(':checked'));
		
		// Ajouter/retirer la classe à la table selon l'état de sélection
		var $table = $('.wp-list-table');
		if (isFullySelected) {
			$table.addClass('ngBetterInterface-table-full-selected');
		} else {
			$table.removeClass('ngBetterInterface-table-full-selected');
		}
		
		// Récupérer le nombre total d'éléments depuis .displaying-num
		var totalItems = 0;
		var $displayingNum = $('.displaying-num');
		if ($displayingNum.length > 0) {
			var displayingText = $displayingNum.text().trim();
			// Extraire le nombre du texte (gère différents formats)
			// "Showing 1-20 of 100 items" -> 100
			// "100 items" -> 100
			// "Showing 1-20 of 100" -> 100
			var match = displayingText.match(/(\d+)(?=\s*(?:items?|$))/i) || displayingText.match(/(\d+)$/);
			if (match) {
				totalItems = parseInt(match[1]);
			}
		}
		
		// Récupérer le nom des éléments depuis le titre de la page
		var itemName = 'selection';
		var $pageTitle = $('h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			itemName = $pageTitle.text().trim().toLowerCase();
			// Nettoyer le nom (retirer les pluriels, articles, etc.)
			itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
		}
		
		// Mettre à jour le compteur avec effet de défilement
		var $counterNumber = $counter.find('.ngBetterInterface-counter-number');
		var $counterText = $counter.find('.ngBetterInterface-counter-text');
		var currentValue = $counterNumber.text();
		var currentText = $counterText.text();
		
		// Déterminer la valeur à afficher et le texte
		var displayValue, displayText;
		if (hasSelectedItems) {
			displayValue = selectedCount + ' / ' + totalItems;
			displayText = 'selected';
		} else {
			displayValue = totalItems;
			displayText = itemName;
		}
		
		// Vérifier si la valeur ou le texte a changé
		if (currentValue !== displayValue.toString() || currentText !== displayText) {
			// Ajouter la classe pour l'animation
			$counterNumber.addClass('counter-changing');
			
			// Mettre à jour la valeur et le texte après un court délai pour déclencher l'animation
			setTimeout(function(){
				$counterNumber.text(displayValue);
				$counterText.text(displayText);
				$counterNumber.removeClass('counter-changing');
			}, 50);
		}
		
		// Vérifier s'il y a des filtres actifs
		var hasActiveFilters = $('.ngBetterInterface-filters-panel-content').children().length > 0;
		
		// Vérifier s'il y a des boutons toujours visibles
		var hasAlwaysVisibleButtons = $('[data-always-visible="true"]').length > 0;
		
		// Vérifier s'il y a des boutons dans la barre (ajouter, recherche, filtres, etc.)
		var hasButtonsInBar = $('.ngBetterInterface-add-button, .ngBetterInterface-search-button, .ngBetterInterface-filters-button, .ngBetterInterface-delete-all-button, .ngBetterInterface-modern-pagination').length > 0;
		
		// Afficher/masquer la barre selon les conditions avec animation
		var $floatingBar = $('.ngBetterInterface-floating-action-bar');
		if (hasSelectedItems || hasActiveFilters || hasAlwaysVisibleButtons || hasButtonsInBar) {
			$floatingBar.removeClass('slide-out').addClass('slide-in');
		} else {
			$floatingBar.removeClass('slide-in').addClass('slide-out');
		}
		
		if (hasSelectedItems) {
			$actions.prop('disabled', false).removeClass('disabled');
			$customButtons.prop('disabled', false).removeClass('disabled');
			$counter.addClass('has-selection');
		} else {
			$actions.prop('disabled', true).addClass('disabled');
			// Désactiver seulement les boutons qui ne sont pas toujours visibles
			$customButtons.not('[data-always-visible="true"]').prop('disabled', true).addClass('disabled');
			$counter.removeClass('has-selection');
		}
		
		// Le bouton filtres et les boutons toujours visibles restent actifs
		$('.ngBetterInterface-filters-button, [data-always-visible="true"]').prop('disabled', false).removeClass('disabled');
	};

	// Pourquoi: améliorer l'ergonomie des listes WP; un clic sur l'arrière-plan d'une ligne toggle la première case à cocher
	BetterInterfaceAdmin.prototype.bindRowBackgroundSelect = function(){
		var self = this;
		$(document).on('click', '.wp-list-table tbody tr', function(e){
			var $target = $(e.target);
			if (self.isInteractive($target)) return;
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"], input[type="checkbox"]').first();
			if ($checkbox.length === 0) return;
			var nextState = !$checkbox.prop('checked');
			$checkbox.prop('checked', nextState).trigger('change');
			self.updateRowSelectedState($row, nextState);
		});
	};

	// Pourquoi: garder l'état visuel de sélection en phase avec les cases à cocher (sélections individuelles et "tout sélectionner")
	BetterInterfaceAdmin.prototype.bindRowCheckboxSync = function(){
		var self = this;
		// Cases par ligne
		$(document).on('change', '.wp-list-table tbody tr input[type="checkbox"]', function(){
			var $row = $(this).closest('tr');
			self.updateRowSelectedState($row, $(this).prop('checked'));
		});
		// Cases "tout sélectionner" (thead/tfoot)
		$(document).on('change', '.wp-list-table thead input[type="checkbox"], .wp-list-table tfoot input[type="checkbox"]', function(){
			$('.wp-list-table tbody tr').each(function(){
				var $row = $(this);
				var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
				if ($checkbox.length) {
					self.updateRowSelectedState($row, $checkbox.prop('checked'));
				}
			});
		});
	};

	// Met à jour la classe de sélection sur la ligne (pour les styles modernes)
	BetterInterfaceAdmin.prototype.updateRowSelectedState = function($row, isSelected){
		$row.toggleClass('ngBetterInterface-row-selected', !!isSelected);
	};

	// À l'init: synchroniser l'état visuel des lignes déjà sélectionnées
	BetterInterfaceAdmin.prototype.initializeSelectedRowsState = function(){
		var self = this;
		$('.wp-list-table tbody tr').each(function(){
			var $row = $(this);
			var $checkbox = $row.find('th.check-column input[type="checkbox"], td.check-column input[type="checkbox"]').first();
			if ($checkbox.length) {
				self.updateRowSelectedState($row, $checkbox.prop('checked'));
			}
		});
	};

	// ===== TRANSITION DE PAGE SMOOTH =====
	// Pourquoi: créer une transition fluide lors des changements de page pour une meilleure UX
	BetterInterfaceAdmin.prototype.initPageTransition = function(){
		var self = this;
		
		// Créer l'overlay de transition s'il n'existe pas
		if ($('.ngBetterInterface-page-transition-overlay').length === 0) {
			$('body').append('<div class="ngBetterInterface-page-transition-overlay"></div>');
		}

		// Intercepter les clics sur les liens de navigation
		$(document).on('click', 'a[href*="admin.php"], a[href*="post.php"], a[href*="edit.php"], a[href*="upload.php"], a[href*="users.php"], a[href*="plugins.php"], a[href*="themes.php"], a[href*="options-general.php"], a[href*="tools.php"], a[href*="edit-comments.php"]', function(e){
			var href = $(this).attr('href');
			
			// Ignorer si Ctrl/Cmd ou le bouton du milieu de la souris est enfoncé (ouvrir dans un nouvel onglet)
			if (e.ctrlKey || e.metaKey || e.which === 2) return;
			
			// Ignorer les liens avec des ancres ou des paramètres spécifiques
			if (href.indexOf('#') === 0 || href.indexOf('javascript:') === 0) return;
			
			// Ignorer les liens qui ouvrent dans un nouvel onglet
			if ($(this).attr('target') === '_blank') return;
			
			// Ignorer les liens de téléchargement
			if (href.indexOf('download') !== -1 || href.indexOf('export') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
			
			// Délai pour permettre à l'animation de se déclencher
			setTimeout(function(){
				window.location.href = href;
			}, 300);
		});

		// Éléments à qui ajouter la classe no-transition (pas de transition de page)
		var noTransitionSelectors = [
			'.search-form.search-plugins',  // Formulaire de recherche de plugins
			// Ajouter d'autres sélecteurs ici selon les besoins
			// '.mon-formulaire-specifique',
			// '.autre-formulaire-ajax'
		];
		
		// Appliquer la classe no-transition aux éléments ciblés
		noTransitionSelectors.forEach(function(selector) {
			$(selector).addClass('no-transition');
		});

		// Intercepter les soumissions de formulaires
		$(document).on('submit', 'form', function(e){
			var $form = $(this);
			var action = $form.attr('action') || '';
			
			// Ignorer les formulaires AJAX ou avec des actions spécifiques
			if ($form.hasClass('no-transition') || action.indexOf('ajax') !== -1) return;
			
			// Activer la transition
			self.showPageTransition();
		});

		// Intercepter les clics sur les boutons de sauvegarde du plugin
		$(document).on('click', '.ngBetterInterface-save-toggle, .ngBetterInterface-save-theme', function(){
			self.showPageTransition();
		});
	};

	// Afficher l'overlay de transition
	BetterInterfaceAdmin.prototype.showPageTransition = function(){
		$('.ngBetterInterface-page-transition-overlay').addClass('active');
	};

	// ===== SYSTÈME DE POSITIONNEMENT DES NOTICES =====
	// Pourquoi: organiser les notices WordPress en colonne verticale à droite pour éviter les superpositions
	BetterInterfaceAdmin.prototype.initNoticesPositioning = function(){
		var self = this;
		
		// Vérifier si on est sur une page d'édition avec le block editor
		if ($('#editor.block-editor__container').length > 0) {
			return; // Ne pas activer le système de notices sur les pages d'édition
		}
		
		// Créer le container pour les notices s'il n'existe pas
		if ($('.ngBetterInterface-notices-container').length === 0) {
			$('body').append('<div class="ngBetterInterface-notices-container"></div>');
		}

		// Fonction pour déplacer une notice dans le container
		function moveNoticeToContainer($notice) {
			// Ignorer les notices avec la classe plugin-dependencies
			if ($notice.hasClass('plugin-dependencies')) {
				return;
			}
			
			// Extraire le nom du thème si la notice est dans un div.theme
			var $themeDiv = $notice.closest('.theme');
			if ($themeDiv.length > 0) {
				var themeSlug = $themeDiv.attr('data-slug');
				if (themeSlug && !$notice.find('.ngBetterInterface-notice-context-title').length) {
					// Formater le nom du thème (slug vers nom lisible)
					var themeName = themeSlug.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
					
					// Ajouter le titre du thème au début de la notice
					var $contextTitle = $('<div class="ngBetterInterface-notice-context-title">' + themeName + '</div>');
					$notice.prepend($contextTitle);
				}
			}
			
			if ($notice.closest('.ngBetterInterface-notices-container').length === 0) {
				$('.ngBetterInterface-notices-container').append($notice);
			}
		}

		// Observer les nouvelles notices qui apparaissent
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === 1) { // Element node
						var $node = $(node);
						
						// Vérifier si c'est une notice ou contient des notices
						if ($node.hasClass('notice') || $node.hasClass('notice-success') || $node.hasClass('notice-error') || $node.hasClass('notice-warning') || $node.hasClass('notice-info')) {
							moveNoticeToContainer($node);
						}
						
						// Chercher des notices dans les enfants
						$node.find('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
							moveNoticeToContainer($(this));
						});
					}
				});
			});
		});

		// Démarrer l'observation
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		// Déplacer les notices existantes
		$('.notice, .notice-success, .notice-error, .notice-warning, .notice-info').each(function() {
			moveNoticeToContainer($(this));
		});
	};

	/**
	 * Détecte le type de posts actuellement affiché
	 * Utilise les mécanismes WordPress natifs pour identifier le contexte
	 */
	BetterInterfaceAdmin.prototype.detectCurrentPostType = function(){
		// Méthode 1: Via l'URL (le plus fiable)
		var urlParams = new URLSearchParams(window.location.search);
		var postType = urlParams.get('post_type');
		if (postType) {
			return postType;
		}
		
		// Méthode 2: Via l'URL path
		var currentPath = window.location.pathname;
		if (currentPath.includes('/wp-admin/edit.php')) {
			// Page de liste des posts - par défaut 'post' si pas de post_type dans l'URL
			return 'post';
		} else if (currentPath.includes('/wp-admin/upload.php')) {
			return 'attachment';
		} else if (currentPath.includes('/wp-admin/edit-comments.php')) {
			return 'comment';
		}
		
		// Méthode 3: Via le body class
		var bodyClasses = document.body.className.split(' ');
		for (var i = 0; i < bodyClasses.length; i++) {
			if (bodyClasses[i].startsWith('post-type-')) {
				return bodyClasses[i].replace('post-type-', '');
			}
		}
		
		// Méthode 4: Via le titre de la page
		var $pageTitle = $('h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			var title = $pageTitle.text().toLowerCase();
			if (title.includes('posts') || title.includes('articles') || title.includes('tous les articles')) {
				return 'post';
			} else if (title.includes('pages') || title.includes('toutes les pages')) {
				return 'page';
			} else if (title.includes('media') || title.includes('médias') || title.includes('bibliothèque')) {
				return 'attachment';
			} else if (title.includes('commentaires') || title.includes('comments')) {
				return 'comment';
			}
		}
		
		// Méthode 5: Via les inputs cachés
		var $postTypeInput = $('input[name="post_type"]');
		if ($postTypeInput.length > 0) {
			return $postTypeInput.val();
		}
		
		// Méthode 6: Via l'ID de la table
		var $table = $('.wp-list-table');
		if ($table.length > 0) {
			var tableId = $table.attr('id');
			if (tableId) {
				if (tableId.includes('posts')) {
					return 'post';
				} else if (tableId.includes('pages')) {
					return 'page';
				} else if (tableId.includes('media')) {
					return 'attachment';
				} else if (tableId.includes('comments')) {
					return 'comment';
				}
			}
		}
		
		// Par défaut, retourner 'post'
		return 'post';
	};

	/**
	 * Récupère les suggestions de recherche via AJAX
	 * Utilise l'endpoint WordPress natif pour une recherche optimisée
	 */
	BetterInterfaceAdmin.prototype.fetchSearchSuggestions = function(query, postType, $container){
		var self = this;
		
		// Debug temporaire
		console.log('Recherche pour:', query, 'Type:', postType);
		
		// Afficher un indicateur de chargement
		$container.html('<div class="ngBetterInterface-suggestions-loading"><span class="dashicons dashicons-update ngBetterInterface-loading-spinner"></span> Recherche en cours...</div>').show();
		
		// Requête AJAX vers l'endpoint WordPress
		$.ajax({
			url: (window.ngBetterInterface_ajax && ngBetterInterface_ajax.ajax_url) || ajaxurl,
			type: 'POST',
			data: {
				action: 'ngBetterInterface_search_suggestions',
				query: query,
				post_type: postType,
				limit: 8,
				nonce: (window.ngBetterInterface_ajax && ngBetterInterface_ajax.nonce) || ''
			},
			success: function(response) {
				console.log('Réponse AJAX:', response);
				if (response.success && response.data.suggestions.length > 0) {
					self.displaySearchSuggestions(response.data.suggestions, $container, query);
				} else {
					var debugInfo = response.data ? 
						'<br><small>Debug: Type "' + response.data.post_type + '", ' + (response.data.total || 0) + ' résultats</small>' : '';
					$container.html('<div class="ngBetterInterface-suggestions-empty">Aucun résultat trouvé pour "' + query + '"' + debugInfo + '</div>').show();
				}
			},
			error: function(xhr, status, error) {
				console.error('Erreur lors de la recherche:', error, xhr.responseText);
				$container.html('<div class="ngBetterInterface-suggestions-error">Erreur lors de la recherche: ' + error + '</div>').show();
			}
		});
	};

	/**
	 * Affiche les suggestions de recherche dans le container
	 * Crée une interface utilisateur moderne et accessible
	 */
	BetterInterfaceAdmin.prototype.displaySearchSuggestions = function(suggestions, $container, query){
		var self = this;
		var html = '<div class="ngBetterInterface-suggestions-title">Suggestions</div><div class="ngBetterInterface-suggestions-list">';
		
		suggestions.forEach(function(suggestion) {
			// Mettre en évidence la requête dans le titre
			var highlightedTitle = suggestion.title.replace(
				new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
				'<mark>$1</mark>'
			);
			
			// Déterminer l'icône selon le statut
			var statusIcon = 'dashicons-admin-post';
			var statusClass = 'status-' + suggestion.status;
			switch(suggestion.status) {
				case 'publish':
					statusIcon = 'dashicons-yes-alt';
					break;
				case 'draft':
					statusIcon = 'dashicons-edit';
					break;
				case 'private':
					statusIcon = 'dashicons-lock';
					break;
				case 'trash':
					statusIcon = 'dashicons-trash';
					break;
			}
			
			// Formater la date
			var formattedDate = new Date(suggestion.date).toLocaleDateString('fr-FR');
			
			html += '<div class="ngBetterInterface-suggestion-item ' + statusClass + '" data-id="' + suggestion.id + '">';
			html += '<div class="ngBetterInterface-suggestion-content">';
			html += '<div class="ngBetterInterface-suggestion-title">' + highlightedTitle + '</div>';
			if (suggestion.context) {
				html += '<div class="ngBetterInterface-suggestion-context">' + suggestion.context + '</div>';
			}
			html += '<div class="ngBetterInterface-suggestion-meta">';
			html += '<span class="ngBetterInterface-suggestion-status"><span class="dashicons ' + statusIcon + '"></span> ' + suggestion.status + '</span>';
			html += '<span class="ngBetterInterface-suggestion-date">' + formattedDate + '</span>';
			html += '</div>';
			html += '</div>';
			html += '<div class="ngBetterInterface-suggestion-actions">';
			html += '<a href="' + suggestion.edit_url + '" class="ngBetterInterface-suggestion-edit" title="Éditer"><span class="dashicons dashicons-edit"></span></a>';
			html += '</div>';
			html += '</div>';
		});
		
		html += '</div>';
		$container.html(html).show();
		
		// Gérer les clics sur les suggestions
		$container.find('.ngBetterInterface-suggestion-item').on('click', function(e){
			// Ignorer si Ctrl/Cmd ou le bouton du milieu de la souris est enfoncé (ouvrir dans un nouvel onglet)
			if (e.ctrlKey || e.metaKey || e.which === 2) return;
			
			e.preventDefault();
			var $item = $(this);
			var editUrl = $item.find('.ngBetterInterface-suggestion-edit').attr('href');
			
			if (editUrl) {
				// Fermer la modale et rediriger vers l'édition
				$('.ngBetterInterface-search-modal').removeClass('ngBetterInterface-search-modal-open');
				$('.ngBetterInterface-search-button').removeClass('active');
				window.location.href = editUrl;
			}
		});
		
		// Gérer le clic sur le bouton d'édition
		$container.find('.ngBetterInterface-suggestion-edit').on('click', function(e){
			e.stopPropagation(); // Empêcher le clic sur l'item parent
		});
	};

	$(function(){
		(new BetterInterfaceAdmin()).init();
	});
})(jQuery); 
