(function($){
	// WPAdminUI: gère les interactions de la page d'admin
	// Pourquoi: utiliser la configuration centralisée WPAdminUI.Config pour accéder aux données
	function WPAdminUI(){
		var ajaxData = window.WPAdminUI && window.WPAdminUI.Config ? window.WPAdminUI.Config.getAjaxData() : {};
		
		this.currentMode = ajaxData.current_mode || 'default';
		this.availableModes = ajaxData.available_modes || {};
		this.currentColorTheme = ajaxData.current_color_theme || 'midnight';
		this.availableColorThemes = ajaxData.available_color_themes || {};
		this.ajaxUrl = ajaxData.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '');
		this.nonce = ajaxData.nonce || '';

		this.selectedMode = null;
		this.selectedTheme = null;
	}

	WPAdminUI.prototype.init = function(){
		this.initAccordionTables();
		this.bindRowBackgroundSelect();
		this.bindRowCheckboxSync();
		this.initializeSelectedRowsState();
		this.initPageTransition();
		this.initNoticesPositioning();
	};



	// ===== Barre d'actions flottante =====
	WPAdminUI.prototype.initAccordionTables = function(){
		var self = this;
		$('.tablenav.top').each(function(){
			var $nav = $(this);

			// Créer une barre flottante sur tous les supports
			self.createFloatingActionBar($nav);
			
			// Gérer le redimensionnement de la fenêtre pour adapter la largeur
			$(window).on('resize', function(){
				$('.ngWPAdminUI-floating-action-bar').toggleClass('ngWPAdminUI-full-width', window.innerWidth < 768);
			});
		});
	};

	WPAdminUI.prototype.isInteractive = function($el){
		return $el.is('button, input, select, textarea, a, label, [contenteditable="true"]') || $el.closest('button, input, select, textarea, a, label, [contenteditable="true"]').length > 0;
	};



			// Créer une barre d'actions flottante en bas de l'écran
		WPAdminUI.prototype.createFloatingActionBar = function($nav){
			var self = this;
			
			// Créer le container de la barre flottante
			var $floatingBar = $('<div class="ngWPAdminUI-floating-action-bar slide-out"></div>');
			var $actionsContainer = $('<div class="ngWPAdminUI-floating-actions"></div>');
			var $paginationContainer = $('<div class="ngWPAdminUI-floating-pagination"></div>');
			
			// Récupérer les données pour le compteur
			var itemName = window.SelectionCounter.getItemName();
			var totalItems = window.SelectionCounter.getTotalItems();
			
			// Créer le compteur d'éléments sélectionnés
			var $counter = window.SelectionCounter.create(totalItems, itemName);
			
			// Créer les boutons d'actions personnalisés
			var actionButtonsResult = window.ActionButtons.create($nav, $actionsContainer);
			var $deleteAllButtonCustom = actionButtonsResult.$deleteAllButtonCustom;
			
			// Récupérer customActions pour FiltersPanel
			// Pourquoi: utiliser la configuration centralisée pour accéder aux actions personnalisées
			var customActions = window.WPAdminUI && window.WPAdminUI.Config ? window.WPAdminUI.Config.getCustomActions() : {};
			
			// Ajouter le bouton delete_all à gauche du compteur s'il existe
			if ($deleteAllButtonCustom) {
				$actionsContainer.append($deleteAllButtonCustom);
			}
			$actionsContainer.append($counter);
		
			// Créer le bouton "Ajouter"
			var $addButton = window.AddButton.create();
			
			// Créer la modale de recherche
			var searchModalResult = window.SearchModal.create(self);
			var $searchModal = searchModalResult.$searchModal;
			var $searchButton = searchModalResult.$searchButton;
			
			// Créer le panneau de filtres
			var filtersPanelResult = window.FiltersPanel.create($nav, customActions);
			var $filtersButton = filtersPanelResult.$filtersButton;
			var $filtersPanel = filtersPanelResult.$filtersPanel;
			var $filtersOverlay = filtersPanelResult.$filtersOverlay;
			var $filtersPanelContent = filtersPanelResult.$filtersPanelContent;
			
			// Gérer la fermeture avec Escape pour les deux modales
			$(document).on('keydown', function(e){
				if (e.key === 'Escape') {
					// Fermer la modale de recherche si elle est ouverte
					if ($searchModal && $searchModal.hasClass('ngWPAdminUI-search-modal-open')) {
						window.SearchModal.close($searchModal, $searchButton);
					}
					// Fermer le panel de filtres s'il est ouvert
					if ($filtersPanel && $filtersPanel.hasClass('ngWPAdminUI-filters-panel-open')) {
						window.FiltersPanel.close($filtersPanel, $filtersOverlay, $filtersButton);
					}
				}
			});
			
			// Créer la pagination moderne
			window.Pagination.create($paginationContainer);
		
		// Assembler la barre flottante avec le nouvel ordre
		// GAUCHE : Bouton Ajouter + Compteur + Actions
		var $leftSection = $('<div class="ngWPAdminUI-floating-left"></div>');
		
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
		var $rightSection = $('<div class="ngWPAdminUI-floating-right"></div>');
		
		// Ajouter le bouton delete_all en premier à droite
		if ($deleteAllButtonCustom) {
			$rightSection.append($deleteAllButtonCustom);
		}
		
		// Ajouter le bouton recherche après delete_all
		if ($searchButton) {
			$rightSection.append($searchButton);
		}
		
		// Ajouter le bouton filtres après recherche (seulement s'il y a des filtres)
		if ($filtersButton && $filtersPanelContent && $filtersPanelContent.children().length > 0) {
			$rightSection.append($filtersButton);
		}
		
		// Ajouter la pagination en dernier à droite
		if ($paginationContainer.children().length > 0) {
			$rightSection.append($paginationContainer);
		}
		
		$floatingBar.append($rightSection);
		
		// Ajouter le panel des filtres et l'overlay au body (seulement s'il y a des filtres)
		if ($filtersPanel && $filtersOverlay && $filtersButton && $filtersPanelContent && $filtersPanelContent.children().length > 0) {
			$('body').append($filtersOverlay);
			$('body').append($filtersPanel);
			
			// Initialiser le badge des filtres
			window.FiltersPanel.updateBadge($filtersPanelContent, $filtersButton);
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
				$floatingBar.addClass('ngWPAdminUI-full-width');
			}
			
			// Masquer la navigation originale seulement sur desktop
			if (window.innerWidth >= 768) {
				$nav.hide();
			}
		}
	};

	// Mettre à jour l'état de la barre flottante (activer/désactiver les actions)
	// Pourquoi: utiliser la configuration centralisée pour les sélecteurs et classes
	WPAdminUI.prototype.updateFloatingBarState = function(){
		var Config = window.WPAdminUI && window.WPAdminUI.Config ? window.WPAdminUI.Config : {};
		var selectors = Config.selectors || {};
		var classes = Config.classes || {};
		var timings = Config.timings || {};
		
		// Utiliser les sélecteurs de la config centralisée
		var selectedCount = $(selectors.listTableCheckboxChecked || '.wp-list-table tbody input[type="checkbox"]:checked').length;
		var hasSelectedItems = selectedCount > 0;
		var $actions = $(selectors.actions || '.ngWPAdminUI-floating-actions button, .ngWPAdminUI-floating-actions input[type="submit"], .ngWPAdminUI-floating-actions select');
		var $customButtons = $(selectors.customButtons || '.ngWPAdminUI-trash-button, .ngWPAdminUI-edit-button, .ngWPAdminUI-update-button, .ngWPAdminUI-delete-all-button');
		var $counter = $(selectors.selectionCounter || '.ngWPAdminUI-selection-counter');
		
		// Vérifier si une case "sélectionner tout" est cochée
		var $selectAll1 = $(selectors.selectAll1 || '#cb-select-all-1');
		var $selectAll2 = $(selectors.selectAll2 || '#cb-select-all-2');
		var isFullySelected = ($selectAll1.length > 0 && $selectAll1.is(':checked')) || ($selectAll2.length > 0 && $selectAll2.is(':checked'));
		
		// Ajouter/retirer la classe à la table selon l'état de sélection
		var $table = $(selectors.listTable || '.wp-list-table');
		if (isFullySelected) {
			$table.addClass(classes.tableFullSelected || 'ngWPAdminUI-table-full-selected');
		} else {
			$table.removeClass(classes.tableFullSelected || 'ngWPAdminUI-table-full-selected');
		}
		
		// Récupérer le nombre total d'éléments depuis .displaying-num
		var totalItems = 0;
		var $displayingNum = $(selectors.displayingNum || '.displaying-num');
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
		var $pageTitle = $(selectors.pageTitle || 'h1.wp-heading-inline');
		if ($pageTitle.length > 0) {
			itemName = $pageTitle.text().trim().toLowerCase();
			// Nettoyer le nom (retirer les pluriels, articles, etc.)
			itemName = itemName.replace(/^all\s+/i, '').replace(/^manage\s+/i, '').replace(/^edit\s+/i, '');
		}
		
		// Mettre à jour le compteur avec effet de défilement
		var $counterNumber = $counter.find(selectors.counterNumber || '.ngWPAdminUI-counter-number');
		var $counterText = $counter.find(selectors.counterText || '.ngWPAdminUI-counter-text');
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
			$counterNumber.addClass(classes.counterChanging || 'counter-changing');
			
			// Mettre à jour la valeur et le texte après un court délai pour déclencher l'animation
			setTimeout(function(){
				$counterNumber.text(displayValue);
				$counterText.text(displayText);
				$counterNumber.removeClass(classes.counterChanging || 'counter-changing');
			}, timings.counterAnimation || 50);
		}
		
		// Vérifier s'il y a des filtres actifs
		var hasActiveFilters = $(selectors.filtersPanelContent || '.ngWPAdminUI-filters-panel-content').children().length > 0;
		
		// Vérifier s'il y a des boutons toujours visibles
		var hasAlwaysVisibleButtons = $(selectors.alwaysVisibleButtons || '[data-always-visible="true"]').length > 0;
		
		// Vérifier s'il y a des boutons dans la barre (ajouter, recherche, filtres, etc.)
		var hasButtonsInBar = $(selectors.addButton + ', ' + selectors.searchButton + ', ' + selectors.filtersButton + ', ' + selectors.deleteAllButton + ', ' + selectors.modernPagination || '.ngWPAdminUI-add-button, .ngWPAdminUI-search-button, .ngWPAdminUI-filters-button, .ngWPAdminUI-delete-all-button, .ngWPAdminUI-modern-pagination').length > 0;
		
		// Afficher/masquer la barre selon les conditions avec animation
		var $floatingBar = $(selectors.floatingBar || '.ngWPAdminUI-floating-action-bar');
		if (hasSelectedItems || hasActiveFilters || hasAlwaysVisibleButtons || hasButtonsInBar) {
			$floatingBar.removeClass(classes.slideOut || 'slide-out').addClass(classes.slideIn || 'slide-in');
		} else {
			$floatingBar.removeClass(classes.slideIn || 'slide-in').addClass(classes.slideOut || 'slide-out');
		}
		
		if (hasSelectedItems) {
			$actions.prop('disabled', false).removeClass(classes.disabled || 'disabled');
			$customButtons.prop('disabled', false).removeClass(classes.disabled || 'disabled');
			$counter.addClass(classes.hasSelection || 'has-selection');
		} else {
			$actions.prop('disabled', true).addClass(classes.disabled || 'disabled');
			// Désactiver seulement les boutons qui ne sont pas toujours visibles
			$customButtons.not(selectors.alwaysVisibleButtons || '[data-always-visible="true"]').prop('disabled', true).addClass(classes.disabled || 'disabled');
			$counter.removeClass(classes.hasSelection || 'has-selection');
		}
		
		// Le bouton filtres et les boutons toujours visibles restent actifs
		$(selectors.filtersButton + ', ' + selectors.alwaysVisibleButtons || '.ngWPAdminUI-filters-button, [data-always-visible="true"]').prop('disabled', false).removeClass(classes.disabled || 'disabled');
	};

	// Pourquoi: améliorer l'ergonomie des listes WP; un clic sur l'arrière-plan d'une ligne toggle la première case à cocher
	WPAdminUI.prototype.bindRowBackgroundSelect = function(){
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
	WPAdminUI.prototype.bindRowCheckboxSync = function(){
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
	WPAdminUI.prototype.updateRowSelectedState = function($row, isSelected){
		$row.toggleClass('ngWPAdminUI-row-selected', !!isSelected);
	};

	// À l'init: synchroniser l'état visuel des lignes déjà sélectionnées
	WPAdminUI.prototype.initializeSelectedRowsState = function(){
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
	WPAdminUI.prototype.initPageTransition = function(){
		var self = this;
		
		// Créer l'overlay de transition s'il n'existe pas
		if ($('.ngWPAdminUI-page-transition-overlay').length === 0) {
			$('body').append('<div class="ngWPAdminUI-page-transition-overlay"></div>');
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
		$(document).on('click', '.ngWPAdminUI-save-toggle, .ngWPAdminUI-save-theme', function(){
			self.showPageTransition();
		});
	};

	// Afficher l'overlay de transition
	WPAdminUI.prototype.showPageTransition = function(){
		$('.ngWPAdminUI-page-transition-overlay').addClass('active');
	};

	// ===== SYSTÈME DE POSITIONNEMENT DES NOTICES =====
	// Pourquoi: organiser les notices WordPress en colonne verticale à droite pour éviter les superpositions
	WPAdminUI.prototype.initNoticesPositioning = function(){
		var self = this;
		
		// Vérifier si on est sur une page d'édition avec le block editor
		if ($('#editor.block-editor__container').length > 0) {
			return; // Ne pas activer le système de notices sur les pages d'édition
		}
		
		// Créer le container pour les notices s'il n'existe pas
		if ($('.ngWPAdminUI-notices-container').length === 0) {
			$('body').append('<div class="ngWPAdminUI-notices-container"></div>');
		}

		// Fonction pour déplacer une notice dans le container
		function moveNoticeToContainer($notice) {
			// Ignorer les notices avec la classe plugin-dependencies
			if ($notice.hasClass('plugin-dependencies')) {
				return;
			}
			
			// Pourquoi: vérifier que la notice n'est pas vide avant de la déplacer
			// Vérifier si la notice a du contenu visible
			var hasContent = false;
			
			// Vérifier le texte direct
			var textContent = $notice.text().trim();
			if (textContent.length > 0) {
				hasContent = true;
			}
			
			// Vérifier les éléments de contenu spécifiques
			if (!$notice.find('.notice-dismiss, .fs-close').length || 
				$notice.find('p, .notice-body, .fs-notice-body, .notice-content, .fs-notice-body').length > 0 ||
				$notice.find('.fs-plugin-title').length > 0) {
				// Si la notice a un contenu ou un titre, elle n'est pas vide
				var bodyContent = $notice.find('.notice-body, .fs-notice-body, .notice-content, p').text().trim();
				var titleContent = $notice.find('.fs-plugin-title, .notice-title').text().trim();
				if (bodyContent.length > 0 || titleContent.length > 0 || textContent.length > 10) {
					hasContent = true;
				}
			}
			
			// Si la notice est vide, ne pas la déplacer
			if (!hasContent) {
				return;
			}
			
			// Extraire le nom du thème si la notice est dans un div.theme
			var $themeDiv = $notice.closest('.theme');
			if ($themeDiv.length > 0) {
				var themeSlug = $themeDiv.attr('data-slug');
				if (themeSlug && !$notice.find('.ngWPAdminUI-notice-context-title').length) {
					// Formater le nom du thème (slug vers nom lisible)
					var themeName = themeSlug.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
					
					// Ajouter le titre du thème au début de la notice
					var $contextTitle = $('<div class="ngWPAdminUI-notice-context-title">' + themeName + '</div>');
					$notice.prepend($contextTitle);
				}
			}
			
			if ($notice.closest('.ngWPAdminUI-notices-container').length === 0) {
				$('.ngWPAdminUI-notices-container').append($notice);
			}
		}

		// Observer les nouvelles notices qui apparaissent
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === 1) { // Element node
						var $node = $(node);
						
						// Vérifier si c'est une notice ou contient des notices
						// Pourquoi: inclure les notices WordPress standard et les notices Freemius
						if ($node.hasClass('notice') || $node.hasClass('notice-success') || $node.hasClass('notice-error') || $node.hasClass('notice-warning') || $node.hasClass('notice-info') || $node.hasClass('fs-notice')) {
							moveNoticeToContainer($node);
						}
						
						// Chercher des notices dans les enfants
						// Pourquoi: détecter les notices WordPress et Freemius dans les éléments enfants
						$node.find('.notice, .notice-success, .notice-error, .notice-warning, .notice-info, .fs-notice').each(function() {
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
		// Pourquoi: inclure les notices WordPress standard et les notices Freemius au chargement
		$('.notice, .notice-success, .notice-error, .notice-warning, .notice-info, .fs-notice').each(function() {
			moveNoticeToContainer($(this));
		});
	};

	/**
	 * Détecte le type de posts actuellement affiché
	 * Utilise les mécanismes WordPress natifs pour identifier le contexte
	 */
	WPAdminUI.prototype.detectCurrentPostType = function(){
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
	WPAdminUI.prototype.fetchSearchSuggestions = function(query, postType, $container){
		var self = this;
		
		// Debug temporaire
		console.log('Recherche pour:', query, 'Type:', postType);
		
		// Afficher un indicateur de chargement
		$container.html('<div class="ngWPAdminUI-suggestions-loading"><span class="dashicons dashicons-update ngWPAdminUI-loading-spinner"></span> Recherche en cours...</div>').show();
		
		// Requête AJAX vers l'endpoint WordPress
		// Pourquoi: utiliser les variables et actions AJAX correctes ngWPAdminUI_* pour correspondre aux hooks WordPress
		$.ajax({
			url: (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.ajax_url) || ajaxurl,
			type: 'POST',
			data: {
				action: 'ngWPAdminUI_search_suggestions',
				query: query,
				post_type: postType,
				limit: 8,
				nonce: (window.ngWPAdminUI_ajax && ngWPAdminUI_ajax.nonce) || ''
			},
			success: function(response) {
				console.log('Réponse AJAX:', response);
				if (response.success && response.data.suggestions.length > 0) {
					self.displaySearchSuggestions(response.data.suggestions, $container, query);
				} else {
					var debugInfo = response.data ? 
						'<br><small>Debug: Type "' + response.data.post_type + '", ' + (response.data.total || 0) + ' résultats</small>' : '';
					$container.html('<div class="ngWPAdminUI-suggestions-empty">Aucun résultat trouvé pour "' + query + '"' + debugInfo + '</div>').show();
				}
			},
			error: function(xhr, status, error) {
				console.error('Erreur lors de la recherche:', error, xhr.responseText);
				$container.html('<div class="ngWPAdminUI-suggestions-error">Erreur lors de la recherche: ' + error + '</div>').show();
			}
		});
	};

	/**
	 * Affiche les suggestions de recherche dans le container
	 * Crée une interface utilisateur moderne et accessible
	 */
	WPAdminUI.prototype.displaySearchSuggestions = function(suggestions, $container, query){
		var self = this;
		var html = '<div class="ngWPAdminUI-suggestions-title">Suggestions</div><div class="ngWPAdminUI-suggestions-list">';
		
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
			
			html += '<div class="ngWPAdminUI-suggestion-item ' + statusClass + '" data-id="' + suggestion.id + '">';
			html += '<div class="ngWPAdminUI-suggestion-content">';
			html += '<div class="ngWPAdminUI-suggestion-title">' + highlightedTitle + '</div>';
			if (suggestion.context) {
				html += '<div class="ngWPAdminUI-suggestion-context">' + suggestion.context + '</div>';
			}
			html += '<div class="ngWPAdminUI-suggestion-meta">';
			html += '<span class="ngWPAdminUI-suggestion-status"><span class="dashicons ' + statusIcon + '"></span> ' + suggestion.status + '</span>';
			html += '<span class="ngWPAdminUI-suggestion-date">' + formattedDate + '</span>';
			html += '</div>';
			html += '</div>';
			html += '<div class="ngWPAdminUI-suggestion-actions">';
			html += '<a href="' + suggestion.edit_url + '" class="ngWPAdminUI-suggestion-edit" title="Éditer"><span class="dashicons dashicons-edit"></span></a>';
			html += '</div>';
			html += '</div>';
		});
		
		html += '</div>';
		$container.html(html).show();
		
		// Gérer les clics sur les suggestions
		$container.find('.ngWPAdminUI-suggestion-item').on('click', function(e){
			// Ignorer si Ctrl/Cmd ou le bouton du milieu de la souris est enfoncé (ouvrir dans un nouvel onglet)
			if (e.ctrlKey || e.metaKey || e.which === 2) return;
			
			e.preventDefault();
			var $item = $(this);
			var editUrl = $item.find('.ngWPAdminUI-suggestion-edit').attr('href');
			
			if (editUrl) {
				// Fermer la modale et rediriger vers l'édition
				$('.ngWPAdminUI-search-modal').removeClass('ngWPAdminUI-search-modal-open');
				$('.ngWPAdminUI-search-button').removeClass('active');
				window.location.href = editUrl;
			}
		});
		
		// Gérer le clic sur le bouton d'édition
		$container.find('.ngWPAdminUI-suggestion-edit').on('click', function(e){
			e.stopPropagation(); // Empêcher le clic sur l'item parent
		});
	};

	$(function(){
		(new WPAdminUI()).init();
	});
})(jQuery); 
